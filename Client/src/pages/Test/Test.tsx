import { useEffect, useState } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID_DRIVE;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY_DRIVE;
const SCOPES = 'https://www.googleapis.com/auth/drive';

// Declare global Google Identity Services
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string; error?: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
    gapi: {
      load: (apis: string, callback: () => void) => void;
      client: {
        init: (config: {
          apiKey: string;
          discoveryDocs: string[];
        }) => Promise<void>;
      };
    };
  }
}

const GoogleDriveUpload = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenClient, setTokenClient] = useState<{ requestAccessToken: () => void } | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<string>(''); // For any folder ID
  const [sharedFolders, setSharedFolders] = useState<Array<{ id: string; name: string; owner: string }>>([]);
  const [myFolders, setMyFolders] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const initializeGapi = async () => {
      try {
        console.log('Loading GAPI...');
        
        // Load GAPI
        await new Promise<void>((resolve) => {
          if (window.gapi && window.gapi.load) {
            window.gapi.load('client', resolve);
          } else {
            // Fallback: wait for gapi to be available
            const checkGapi = () => {
              if (window.gapi && window.gapi.load) {
                window.gapi.load('client', resolve);
              } else {
                setTimeout(checkGapi, 100);
              }
            };
            checkGapi();
          }
        });

        console.log('Initializing GAPI client...');
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });

        console.log('Initializing Google Identity Services...');
        // Wait for Google Identity Services to be available
        await new Promise<void>((resolve) => {
          const checkGoogle = () => {
            if (window.google && window.google.accounts && window.google.accounts.oauth2) {
              resolve();
            } else {
              setTimeout(checkGoogle, 100);
            }
          };
          checkGoogle();
        });

        // Initialize the token client
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response) => {
            if (response.error) {
              console.error('Token client error:', response.error);
              setError('Failed to get access token: ' + response.error);
              setIsLoading(false);
              return;
            }
            
            console.log('Access token received');
            setAccessToken(response.access_token);
            setIsSignedIn(true);
            setError(null);
            setIsLoading(false);
          },
        });

        setTokenClient(client);
        console.log('Google APIs initialized successfully');
        setError(null);
      } catch (error) {
        console.error('Error loading Google APIs:', error);
        setError('Failed to initialize Google Drive API');
        setIsLoading(false);
      }
    };

    initializeGapi();
  }, []);

  const signIn = () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!tokenClient) {
        throw new Error('Google API not initialized');
      }

      console.log('Requesting access token...');
      tokenClient.requestAccessToken();
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Failed to sign in');
      setIsLoading(false);
    }
  };

  const signOut = () => {
    try {
      setIsLoading(true);
      setAccessToken(null);
      setIsSignedIn(false);
      setError(null);
      setSharedFolders([]); // Clear shared folders
      setMyFolders([]); // Clear my folders
      setTargetFolderId(''); // Clear selected folder
      
      console.log('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  const createFolder = async (folderName: string) => {
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const metadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create folder: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Folder created:', result);
    return result.id;
  };

  const fetchSharedFolders = async () => {
    if (!accessToken) {
      alert('Please sign in first.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching shared folders...');

      // Query for folders that are shared with you (not owned by you)
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?q=mimeType%3D%27application%2Fvnd.google-apps.folder%27%20and%20sharedWithMe%3Dtrue&fields=files(id%2Cname%2Cowners)&orderBy=name',
        {
          method: 'GET',
          headers: new Headers({
            Authorization: `Bearer ${accessToken}`,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch shared folders: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Shared folders fetched:', result);
      
      const folders = result.files?.map((file: { id: string; name: string; owners?: { displayName?: string }[] }) => ({
        id: file.id,
        name: file.name,
        owner: file.owners?.[0]?.displayName || 'Unknown'
      })) || [];

      setSharedFolders(folders);
      alert(`Found ${folders.length} shared folders`);
    } catch (err) {
      console.error('Fetch shared folders error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch shared folders';
      setError(errorMessage);
      alert('Failed to fetch shared folders: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyFolders = async () => {
    if (!accessToken) {
      alert('Please sign in first.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching my folders...');

      // Query for folders that you own
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?q=mimeType%3D%27application%2Fvnd.google-apps.folder%27%20and%20%27me%27%20in%20owners&fields=files(id%2Cname)&orderBy=name',
        {
          method: 'GET',
          headers: new Headers({
            Authorization: `Bearer ${accessToken}`,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch my folders: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('My folders fetched:', result);
      
      const folders = result.files?.map((file: { id: string; name: string }) => ({
        id: file.id,
        name: file.name,
      })) || [];

      setMyFolders(folders);
      alert(`Found ${folders.length} of your own folders`);
    } catch (err) {
      console.error('Fetch my folders error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch my folders';
      setError(errorMessage);
      alert('Failed to fetch my folders: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllFolders = async () => {
    if (!accessToken) {
      alert('Please sign in first.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching all folders...');

      // Fetch both my folders and shared folders
      await Promise.all([
        fetchMyFolders(),
        fetchSharedFolders()
      ]);

    } catch (err) {
      console.error('Fetch all folders error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch folders';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error('No access token available. Please sign in first.');
      }

      console.log('Uploading file:', selectedFile.name);

      // Option 1: Upload to a specific shared folder if selected
      const metadata: {
        name: string;
        mimeType: string;
        parents?: string[];
      } = {
        name: selectedFile.name,
        mimeType: selectedFile.type,
      };

      if (targetFolderId) {
        metadata.parents = [targetFolderId];
        console.log('Uploading to target folder:', targetFolderId);
      } else {
        console.log('Uploading to root directory');
      }

      const form = new FormData();
      form.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' })
      );
      form.append('file', selectedFile);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({
          Authorization: `Bearer ${accessToken}`,
        }),
        body: form,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      alert('File uploaded successfully: ' + result.name);
      setSelectedFile(null); // clear after upload
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
      alert('Failed to upload file: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {isSignedIn ? (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Target Folder (Optional):</label>
            <div className="flex gap-2">
              <select
                value={targetFolderId}
                onChange={(e) => setTargetFolderId(e.target.value)}
                className="flex-1 border rounded px-3 py-2"
                disabled={isLoading}
                title="Select target folder for upload"
                aria-label="Select target folder for upload"
              >
                <option value="">Upload to My Drive (Root)</option>
                
                {/* Your own folders */}
                {myFolders.length > 0 && (
                  <optgroup label="📁 My Folders">
                    {myFolders.map((folder) => (
                      <option className='text-black' key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                
                {/* Shared folders */}
                {sharedFolders.length > 0 && (
                  <optgroup label="🤝 Shared with Me">
                    {sharedFolders.map((folder) => (
                      <option className='text-black' key={folder.id} value={folder.id}>
                        {folder.name} (by {folder.owner})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <button
                type="button"
                onClick={fetchAllFolders}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={isLoading}
              >
                Refresh Folders
              </button>
            </div>
            <p className="text-sm text-gray-600">
              {targetFolderId ? 'Will upload to selected folder' : 'Will upload to your Drive root'}
            </p>
          </div>

          <input
            placeholder='Select a file to upload'
            type="file"
            onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
            disabled={isLoading}
          />
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={uploadFile}
              className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload to Drive'}
            </button>
            <button
              type="button"
              onClick={() => createFolder('Smart Marks Uploads')}
              className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={isLoading}
            >
              Create Folder
            </button>
          </div>
          
          <button
            type="button"
            onClick={signOut}
            className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={signIn}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In with Google'}
        </button>
      )}
    </div>
  );
};

export default GoogleDriveUpload;