

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    setSectionInfo,
    updateSectionField,
    selectSectionInformation
} from '../redux/features/sectionInformationSlice';
import type { SectionInformationState } from '../redux/features/sectionInformationSlice';


interface SectionInformationProps {
    from: string;
    onSubmit?: (data: SectionInformationState) => void;
    nextRoute?: string;
}

const SectionInformation: React.FC<SectionInformationProps> = ({ from, onSubmit }) => {
    const dispatch = useDispatch();
    const formData = useSelector(selectSectionInformation);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Validate batch number
        if (name === 'batch') {
            const batchNum = parseInt(value);
            if (isNaN(batchNum) || batchNum < 1 || batchNum > 999) {
                return;
            }
        }

        // Validate course code format - only restrict input on final submission
        // Allow users to type freely in the input field
        if (name === 'courseCode') {
            // Only allow uppercase letters, numbers, and hyphen
            const courseCodeInputPattern = /^[A-Z0-9-]*$/;
            if (value && !courseCodeInputPattern.test(value)) {
                return;
            }
        }

        dispatch(updateSectionField({ field: name as keyof Omit<SectionInformationState, 'isSubmitted'>, value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setSectionInfo({
            department: formData.department,
            section: formData.section,
            batch: formData.batch,
            semester: formData.semester,
            courseTitle: formData.courseTitle,
            courseCode: formData.courseCode,
            year: formData.year,
            courseCredit: formData.courseCredit,
            noOfClassConducted: formData.noOfClassConducted
        }));

        if (onSubmit) {
            onSubmit(formData);
        }


    };

    // List of departments
    const departments = [
        'CSE - Computer Science & Engineering',
        'SWE - Software Engineering',
        'EEE - Electrical & Electronic Engineering',
        'CE - Civil Engineering',
        'BBA - Bachelor of Business Administration'
    ];

    // List of semesters
    const semesters = [
        'Spring',
        'Summer',
        'Fall'
    ];
    const batch = [
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'
    ]
    const courseCredit = [
        '1', '2', '3', '4', '5', '6',
    ]
    const courseCode = [
        'CSE-111', 'CSE-112', 'CSE-113', 'CSE-114', 'CSE-115', 'CSE-116',
        'CSE-211', 'CSE-212', 'CSE-213', 'CSE-214', 'CSE-215', 'CSE-216',
        'CSE-311', 'CSE-312', 'CSE-313', 'CSE-314', 'CSE-315', 'CSE-316',
        'CSE-411', 'CSE-412', 'CSE-413', 'CSE-414', 'CSE-415', 'CSE-416'
    ]
    const sections = [
        'A', 'B', 'C', 'D', 'E', 'F'
    ];
    return (
        <div className="card  shadow-md w-full bg-white border">
            <div className="card-body">
                <h2 className="card-title text-2xl font-semibold text-primary mb-4">Course Information</h2>

                <form onSubmit={handleSubmit} className="space-y-6 !text-black" >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Department */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Department</span>
                            </label>
                            <select
                                id="department"
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                                className="select select-bordered w-full bg-white text-black border-gray-300 focus:outline-none focus:ring-0"
                                required
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Section */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Section</span>
                            </label>
                            <select
                                id="section"
                                name="section"
                                value={formData.section}
                                onChange={handleInputChange}
                                className="select select-bordered w-full bg-white text-black border-gray-300 focus:outline-none focus:ring-0"
                                required
                            >
                                <option value="">Select Section</option>
                                {sections.map((section) => (
                                    <option key={section} value={section}>
                                        {section}
                                    </option>
                                ))}
                            </select>
                        </div>    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Batch */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Batch</span>
                            </label>
                            <select
                                id="batch"
                                name="batch"
                                value={formData.batch}
                                onChange={handleInputChange}
                                className="select select-bordered w-full bg-white text-black border-gray-300 focus:outline-none focus:ring-0"
                                required
                                title="Batch should be a number between 1 and 999"
                            >
                                <option value="">Select Batch</option>
                                {batch.map((b) => (
                                    <option key={b} value={b}>
                                        {b}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Semester */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Semester</span>
                            </label>
                            <select
                                id="semester"
                                name="semester"
                                value={formData.semester}
                                onChange={handleInputChange}
                                className="select select-bordered w-full bg-white text-black border-gray-300 focus:outline-none focus:ring-0"
                                required
                            >
                                <option value="">Select Semester</option>
                                {semesters.map((sem) => (
                                    <option key={sem} value={sem}>
                                        {sem}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Course Title */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Course Title</span>
                            </label>
                            <select
                                id="courseTitle"
                                name="courseTitle"
                                value={formData.courseTitle}
                                onChange={handleInputChange}
                                className="select select-bordered w-full bg-white text-black border-gray-300 focus:outline-none focus:ring-0"
                                required
                            >
                                <option value="">Select Course Title</option>
                                {/* Example course titles, replace/add as needed */}
                                <option value="Web Engineering">Web Engineering</option>
                                <option value="Database Systems">Database Systems</option>
                                <option value="Software Engineering">Software Engineering</option>
                                <option value="Computer Networks">Computer Networks</option>
                                <option value="Operating Systems">Operating Systems</option>
                                <option value="Data Structures">Data Structures</option>
                                <option value="Algorithms">Algorithms</option>
                                <option value="Artificial Intelligence">Artificial Intelligence</option>
                                <option value="Machine Learning">Machine Learning</option>
                            </select>
                        </div>

                        {/* Course Code */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Course Code</span>
                            </label>
                            <select
                                id="courseCode"
                                name="courseCode"
                                value={formData.courseCode}
                                onChange={handleInputChange}
                                className="select select-bordered w-full bg-white text-black border-gray-300 focus:outline-none focus:ring-0"
                                required
                                title="Course code should be in format: XX-111 or XXX-111"
                            >
                                <option value="">Select Course Code</option>
                                {courseCode.map((code) => (
                                    <option key={code} value={code}>
                                        {code}
                                    </option>
                                ))}
                            </select>
                        </div>    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Year */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Year</span>
                            </label>
                            <input
                                type="number"
                                id="year"
                                name="year"
                                value={formData.year}
                                onChange={handleInputChange}
                                min="2000"
                                max="2099"
                                className="input input-bordered w-full bg-white text-black border-gray-300 focus:outline-none focus:ring-0"
                                required
                            />
                        </div>
                        {/* course credit */}


                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Course credit</span>
                            </label>
                            <select
                                id="courseCredit"
                                name="courseCredit"
                                value={formData.courseCredit}
                                onChange={handleInputChange}
                                className="select select-bordered w-full bg-white text-black border-gray-300 focus:outline-none focus:ring-0"
                                required
                            >
                                <option value="">Select Course Credit</option>
                                {courseCredit.map((credit) => (
                                    <option key={credit} value={credit}>
                                        {credit}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>
                    {from == "file-submission" && <div className="">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* no of class conducted */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">No of class conducted</span>
                                </label>
                                <input
                                    type="text"
                                    id="noOfClassConducted"
                                    name="noOfClassConducted"
                                    value={formData.noOfClassConducted}
                                    onChange={handleInputChange}
                                    placeholder="30"
                                    className="input input-bordered w-full bg-white text-black border-gray-300 focus:outline-none focus:ring-0"
                                    required
                                />
                            </div>
                        </div>

                    </div>}
                    {/* Submit Button */}
                    <div className="form-control mt-6">
                        <button type="submit" className="btn btn-primary w-full">
                            Next
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default SectionInformation;