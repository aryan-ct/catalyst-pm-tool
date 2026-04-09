import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCheckIcon, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ProjectItem = {
  name: string;
};

const ProjectsArray: ProjectItem[] = [
  { name: 'Project 1' },
  { name: 'Project 2' },
];

export default function ProjectsList() {
  const [selectedProject, setSelectedProject] = useState<ProjectItem>(
    ProjectsArray[0],
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filterBySearchQuery = ProjectsArray.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function renderSelectedProject() {
    return (
      <div className="flex items-center gap-2">
        <span>{selectedProject.name}</span>
      </div>
    );
  }

  function renderDropDownMenuItem(projectItem: ProjectItem) {
    return (
      <div
        className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
        onClick={() => {
          setSelectedProject(projectItem);
          setIsOpen(false);
        }}
      >
        <span>{projectItem.name}</span>
        {projectItem.name === selectedProject.name && (
          <CheckCheckIcon className="ml-auto" />
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Label className="opacity-75 text-sm font-medium">Projects</Label>
      <div className="mt-1 w-full">
        <Button
          className="w-full h-11 flex justify-between items-center border"
          onClick={() => setIsOpen(!isOpen)}
        >
          {renderSelectedProject()}
        </Button>
      </div>
      {isOpen && (
        <div className="absolute overflow-hidden z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 p-2 pl-8 text-sm border-b border-gray-300 focus:outline-none pverflow-hidden"
            placeholder="Search a project.."
            autoFocus
          />
          <Search className="absolute top-[13px] left-2 text-lg text-gray-500" />
          <div className="max-h-60 overflow-y-auto my-2">
            {filterBySearchQuery.map((projectItem, index) => (
              <div key={index} className="text-sm">
                {renderDropDownMenuItem(projectItem)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
