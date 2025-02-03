import React from 'react';
import { Tag } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
}

interface SubjectFilterProps {
  subjects: Subject[];
  selectedSubject: string | null;
  onSubjectChange: (subjectId: string | null) => void;
}

export default function SubjectFilter({
  subjects,
  selectedSubject,
  onSubjectChange,
}: SubjectFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center mb-4">
        <Tag className="h-5 w-5 text-indigo-600 mr-2" />
        <h2 className="text-lg font-semibold">教科フィルター</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSubjectChange(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !selectedSubject
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          すべて
        </button>
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSubjectChange(subject.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedSubject === subject.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {subject.name}
          </button>
        ))}
      </div>
    </div>
  );
}