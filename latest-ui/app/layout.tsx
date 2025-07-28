import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export const metadata: Metadata = {
  title: 'Smart Marking System',
  description: 'Created with Next.js and shadcn/ui',
  generator: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
           {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Mark Input System
                </h1>
                <p className="text-gray-600 mt-1">Manage student assessments and grades</p>
              </div>
              <div className="flex items-center gap-4">
                {/* <div className="flex items-center gap-3">
                
               
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 capitalize">{user?.role?.replace("_", " ")}</p>
                      <Badge
                        className={`text-xs ${user?.role === "module_leader" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}
                      >
                        {user?.department}
                      </Badge>
                    </div>
                  </div>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Avatar className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500">
                    <AvatarFallback className="text-white font-semibold">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                     
                        <DropdownMenuItem>
                          Profile
                          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem  onClick={logout}>
                          Log out
                          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div> */}
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-transparent"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button> */}
              </div>
            </div>
          </div>
        {children}
        </body>
    </html>
  )
}
