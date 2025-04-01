"use client";

import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/Button";
import { Label } from "../components/ui/label";
import { getScheduleTable } from "../scraper";

export default function Demo({ title }: { title?: string } = { title: "Colorado College Course Search" }) {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("all");
  const [selectedBlock, setSelectedBlock] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [table, setTable] = useState<string | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [tableRows, setTableRows] = useState<Element[]>([]);
  const [filteredRows, setFilteredRows] = useState<Element[]>([]);
  const rowsPerPage = 20;

  // Sorting state
  const [sortBy, setSortBy] = useState("courseId"); // Default sort by Course ID

  // Academic terms options
  const terms = [
    { value: "all", label: "All Terms" },
    { value: "2024-2025", label: "2024-2025 Academic Year" },
    { value: "fall2024", label: "Fall 2024" },
    { value: "spring2025", label: "Spring 2025" },
    { value: "spring2026", label: "Spring 2026" }
  ];

  // Block options
  const blocks = [
    { value: "all", label: "All Blocks" },
    { value: "block1", label: "Block 1" },
    { value: "block2", label: "Block 2" },
    { value: "block3", label: "Block 3" },
    { value: "block4", label: "Block 4" },
    { value: "block5", label: "Block 5" },
    { value: "block6", label: "Block 6" },
    { value: "block7", label: "Block 7" },
    { value: "block8", label: "Block 8" },
    { value: "blockA", label: "Block A" },
    { value: "blockB", label: "Block B" },
    { value: "blockC", label: "Block C" },
    { value: "blockH", label: "Half Block" },
  ];
  
  // Program options from the original dropdown
  const programs = [
    { value: "all", label: "All Programs" },
    { value: "Anthropology", label: "Anthropology" },
    { value: "Arabic", label: "Arabic" },
    { value: "ArtHistory", label: "Art History" },
    { value: "ArtStudio", label: "Art Studio" },
    { value: "AsianStudies", label: "Asian Studies" },
    { value: "BusinessEconomicsSociety", label: "Business, Economics, & Society" },
    { value: "ChemistryBiochemistry", label: "Chemistry & Biochemistry" },
    { value: "ChineseLanguage", label: "Chinese Language" },
    { value: "Classics", label: "Classics" },
    { value: "ComparativeLiterature", label: "Comparative Literature" },
    { value: "ComputerScience", label: "Computer Science" },
    { value: "DanceStudio", label: "Dance Studio" },
    { value: "DanceTheory", label: "Dance Theory" },
    { value: "Economics", label: "Economics" },
    { value: "Education", label: "Education" },
    { value: "English", label: "English" },
    { value: "EnvironmentalProgram", label: "Environmental Program" },
    { value: "FeministandGenderStudies", label: "Feminist and Gender Studies" },
    { value: "FilmStudies", label: "Film Studies" },
    { value: "FilmandMedia", label: "Film and Media" },
    { value: "FirstYearFoundations", label: "First Year Foundations" },
    { value: "French", label: "French" },
    { value: "GeneralStudies", label: "General Studies" },
    { value: "Geology", label: "Geology" },
    { value: "German", label: "German" },
    { value: "Hebrew", label: "Hebrew" },
    { value: "History", label: "History" },
    { value: "HumanBiologyandKinesiology", label: "Human Biology and Kinesiology" },
    { value: "Italian", label: "Italian" },
    { value: "Japanese", label: "Japanese" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "MolecularBiology", label: "Molecular Biology" },
    { value: "MuseumStudies", label: "Museum Studies" },
    { value: "Music", label: "Music" },
    { value: "OrganismalBiologyEcology", label: "Organismal Biology & Ecology" },
    { value: "Philosophy", label: "Philosophy" },
    { value: "Physics", label: "Physics" },
    { value: "PoliticalScience", label: "Political Science" },
    { value: "Portuguese", label: "Portuguese" },
    { value: "Psychology", label: "Psychology" },
    { value: "RaceEthnicityandMigrationStudies", label: "Race, Ethnicity, and Migration Studies" },
    { value: "Religion", label: "Religion" },
    { value: "Russian", label: "Russian" },
    { value: "RussianandEurasianStudies", label: "Russian and Eurasian Studies" },
    { value: "Sociology", label: "Sociology" },
    { value: "SouthwestStudies", label: "Southwest Studies" },
    { value: "Spanish", label: "Spanish" },
    { value: "StudiesinHumanities", label: "Studies in Humanities" },
    { value: "StudiesinNaturalSciences", label: "Studies in Natural Sciences" },
    { value: "Theatre", label: "Theatre" }
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const tableData = await getScheduleTable();
        setTable(tableData);
        console.log("Scraped table:", tableData);
        
        // Parse the table HTML and extract rows
        if (tableData) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(`<table>${tableData}</table>`, 'text/html');
          const rows = Array.from(doc.querySelectorAll('tr'));
          setTableRows(rows);
          setFilteredRows(rows); // Initially, filtered rows are the same as all rows
        }
      } catch (err) {
        console.error("Error fetching table:", err);
        setError("Failed to load course data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Modified search function that accepts term, block, and program parameters
  const performSearch = (term: string, block: string, program: string) => {
    console.log("Performing search - Term:", searchTerm, "Selected term:", term, "Selected block:", block, "Selected program:", program);
    
    // If search term is empty and all filters are "all", show all rows
    if (!searchTerm.trim() && term === "all" && block === "all" && program === "all") {
      setFilteredRows(tableRows);
      setCurrentPage(1);
      return;
    }
    
    // Get header row (always include it)
    const headerRow = tableRows.length > 0 ? [tableRows[0]] : [];
    
    // Filter data rows
    const dataRows = tableRows.length > 0 ? tableRows.slice(1) : [];
    const matchedRows = dataRows.filter(row => {
      const rowText = row.textContent?.toLowerCase() || '';
      
      // Check keyword matches
      const keywords = searchTerm.toLowerCase().split(/\s+/).filter(k => k);
      const keywordMatch = keywords.length === 0 || 
        keywords.some(keyword => rowText.includes(keyword));
      
      // Check term match
      const termMatch = term === "all" || 
        checkTermMatch(rowText, term);
        
      // Check block match
      const blockMatch = block === "all" || 
        checkBlockMatch(rowText, block);
      
      // Check program match by looking for class="title program-XX"
      const programMatch = program === "all" || 
        checkProgramMatch(row, program);
      
      // Row must match all four filters: keyword, term, block, and program
      return keywordMatch && termMatch && blockMatch && programMatch;
    });
    
    // Combine header with matched rows
    setFilteredRows([...headerRow, ...matchedRows]);
    
    // Reset to first page after search
    setCurrentPage(1);
  };

  // Function to sort rows
  const sortRows = (rows: Element[], sortBy: string): Element[] => {
    if (rows.length === 0) return rows;

    const headerRow = rows[0];
    const dataRows = rows.slice(1);

    const sortedRows = dataRows.sort((a, b) => {
      const aText = a.textContent?.toLowerCase() || "";
      const bText = b.textContent?.toLowerCase() || "";

      if (sortBy === "courseId") {
        // Sort by Course ID (e.g., "CS101")
        const aMatch = aText.match(/([A-Z]{2,4})\s*(\d{1,3})/i);
        const bMatch = bText.match(/([A-Z]{2,4})\s*(\d{1,3})/i);

        if (aMatch && bMatch) {
          const aDept = aMatch[1]; // Extract department code (e.g., "CS")
          const bDept = bMatch[1];
          const aNum = parseInt(aMatch[2], 10); // Extract course number (e.g., 101)
          const bNum = parseInt(bMatch[2], 10);

          // First, compare department codes alphabetically
          const deptComparison = aDept.localeCompare(bDept);
          if (deptComparison !== 0) {
            return deptComparison;
          }

          // If department codes are the same, compare course numbers numerically
          return aNum - bNum;
        }
      } else if (sortBy === "block") {
        // Sort by Block (e.g., "Block 1" or "Block A")
        const aMatch = aText.match(/block\s*(\d+|[a-z])/i);
        const bMatch = bText.match(/block\s*(\d+|[a-z])/i);

        if (aMatch && bMatch) {
          const aBlock = aMatch[1];
          const bBlock = bMatch[1];

          // Check if both are numbers
          if (!isNaN(Number(aBlock)) && !isNaN(Number(bBlock))) {
            const blockComparison = Number(aBlock) - Number(bBlock);
            if (blockComparison !== 0) {
              return blockComparison;
            }
          }

          // Check if both are letters
          if (isNaN(Number(aBlock)) && isNaN(Number(bBlock))) {
            const blockComparison = aBlock.localeCompare(bBlock);
            if (blockComparison !== 0) {
              return blockComparison;
            }
          }

          // Numbers come before letters
          if (!isNaN(Number(aBlock)) !== !isNaN(Number(bBlock))) {
            return isNaN(Number(aBlock)) ? 1 : -1;
          }
        }

        // If blocks are the same, sort by Course ID
        const aCourseMatch = aText.match(/([A-Z]{2,4})\s*(\d{1,3})/i);
        const bCourseMatch = bText.match(/([A-Z]{2,4})\s*(\d{1,3})/i);

        if (aCourseMatch && bCourseMatch) {
          const aDept = aCourseMatch[1];
          const bDept = bCourseMatch[1];
          const aNum = parseInt(aCourseMatch[2], 10);
          const bNum = parseInt(bCourseMatch[2], 10);

          // First, compare department codes alphabetically
          const deptComparison = aDept.localeCompare(bDept);
          if (deptComparison !== 0) {
            return deptComparison;
          }

          // If department codes are the same, compare course numbers numerically
          return aNum - bNum;
        }
      }

      return 0;
    });

    return [headerRow, ...sortedRows];
  };

  // Apply sorting whenever rows or sortBy changes
  useEffect(() => {
    if (tableRows.length > 0) {
      const sortedRows = sortRows(tableRows, sortBy);
      setFilteredRows(sortedRows);
    }
  }, [tableRows, sortBy]);

  // Form submission handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(selectedTerm, selectedBlock, selectedProgram);
  };
  
  // Handle term selection change - immediately perform search
  const handleTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTerm = e.target.value;
    setSelectedTerm(newTerm);
    
    // Use the new value directly instead of relying on the state variable
    setTimeout(() => {
      performSearch(newTerm, selectedBlock, selectedProgram);
    }, 0);
  };
  
  // Handle block selection change - immediately perform search
  const handleBlockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBlock = e.target.value;
    setSelectedBlock(newBlock);
    
    // Use the new value directly instead of relying on the state variable
    setTimeout(() => {
      performSearch(selectedTerm, newBlock, selectedProgram);
    }, 0);
  };
  
  // Handle program selection change - immediately perform search
  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProgram = e.target.value;
    setSelectedProgram(newProgram);
    
    // Use the new value directly instead of relying on the state variable
    setTimeout(() => {
      performSearch(selectedTerm, selectedBlock, newProgram);
    }, 0);
  };

  // Handle search term changes
  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Uncomment the following lines to search immediately on every keystroke
    setTimeout(() => {
      performSearch(selectedTerm, selectedBlock, selectedProgram);
    }, 300); // Debounce search for 300ms
  };

  // Handle sort option change
  const handleSortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSortBy(e.target.value);
  };
  
  // Function to check if a row matches the selected term
  const checkTermMatch = (rowText: string, term: string): boolean => {
    // This is a simplified implementation. You'll need to adjust based on
    // the actual format of the term information in your course data
    switch(term) {
      case "2024-2025":
        return rowText.includes("2024") || rowText.includes("2025");
      case "fall2024":
        return rowText.includes("fall 2024") || 
          (rowText.includes("fall") && rowText.includes("2024")) || 
          rowText.includes("block 1 2024") || 
          rowText.includes("block 2 2024") || 
          rowText.includes("block 3 2024") || 
          rowText.includes("block 4 2024");
      case "spring2025":
        return rowText.includes("spring 2025") || 
          (rowText.includes("spring") && rowText.includes("2025")) || 
          rowText.includes("block 5 2025") || 
          rowText.includes("block 6 2025") || 
          rowText.includes("block 7 2025") || 
          rowText.includes("block 8 2025");
      case "spring2026":
        return rowText.includes("spring 2026") || 
          (rowText.includes("spring") && rowText.includes("2026")) || 
          rowText.includes("block 5 2026") || 
          rowText.includes("block 6 2026") || 
          rowText.includes("block 7 2026") || 
          rowText.includes("block 8 2026");
      default:
        return true;
    }
  };
  
  // Function to check if a row matches the selected block
  const checkBlockMatch = (rowText: string, block: string): boolean => {
    switch(block) {
      case "block1":
        return rowText.includes("block 1") || rowText.includes("block1");
      case "block2":
        return rowText.includes("block 2") || rowText.includes("block2");
      case "block3":
        return rowText.includes("block 3") || rowText.includes("block3");
      case "block4":
        return rowText.includes("block 4") || rowText.includes("block4");
      case "block5":
        return rowText.includes("block 5") || rowText.includes("block5");
      case "block6":
        return rowText.includes("block 6") || rowText.includes("block6");
      case "block7":
        return rowText.includes("block 7") || rowText.includes("block7");
      case "block8":
        return rowText.includes("block 8") || rowText.includes("block8");
      case "blockA":
        return rowText.includes("block a");
      case "blockB":
        return rowText.includes("block b");
      case "blockC":
        return rowText.includes("Block c");
      case "blockH":
        return rowText.includes("block h");
      default:
        return true;
    }
  };
  
  // Function to check if a row matches the selected program
  const checkProgramMatch = (row: Element, program: string): boolean => {
    // Look for elements with class="title program-XX" within the row
    const titleElements = row.querySelectorAll('.title');
    
    // Check each title element for the program class
    for (const element of Array.from(titleElements)) {
      if (element.classList.contains(`program-${program}`)) {
        return true;
      }
    }
    
    // Also check if row itself has class that matches program
    if (row.classList.contains(`program-${program}`)) {
      return true;
    }
    
    // Check cell content as fallback - some programs might be identified by text only
    const rowText = row.textContent || '';
    if (rowText.includes(`(${program})`) || 
        rowText.includes(`${program}-`) ||
        rowText.match(new RegExp(`\\b${program}\\s+\\d`))) {
      return true;
    }
    
    return false;
  };
  
  // Get header row
  const headerRow = filteredRows.length > 0 ? filteredRows[0] : null;
  
  // Get data rows (excluding header)
  const dataRows = filteredRows.length > 0 ? filteredRows.slice(1) : [];
  
  // Calculate total number of pages based on data rows (not including header)
  const totalPages = Math.ceil(dataRows.length / rowsPerPage);
  
  // Get current page rows from data rows only
  const getCurrentPageRows = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return dataRows.slice(startIndex, endIndex);
  };
  
  // Generate HTML for current page data rows
  const currentPageHTML = getCurrentPageRows()
    .map(row => row.outerHTML)
    .join('');
  
  // Handle page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of table
      document.getElementById('course-table')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">{title}</h1>
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="course-search" className="text-sm font-medium">
            Search for courses
          </Label>
          <div className="flex gap-2">
            <Input
              id="course-search"
              type="text"
              placeholder="Enter course name, department, or keyword..."
              value={searchTerm}
              onChange={handleSearchTermChange}
              className="flex-1"
            />
            <Button type="submit">
              Search
            </Button>
          </div>
        </div>

        {/* Filter controls - all dropdowns in one line */}
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="space-y-2 flex-1 min-w-[180px]">
            <Label htmlFor="term-select" className="text-sm font-medium">
              Filter by Term
            </Label>
            <select
              id="term-select"
              value={selectedTerm}
              onChange={handleTermChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {terms.map((term) => (
                <option key={term.value} value={term.value}>
                  {term.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2 flex-1 min-w-[180px]">
            <Label htmlFor="block-select" className="text-sm font-medium">
              Filter by Block
            </Label>
            <select
              id="block-select"
              value={selectedBlock}
              onChange={handleBlockChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {blocks.map((block) => (
                <option key={block.value} value={block.value}>
                  {block.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2 flex-1 min-w-[180px]">
            <Label htmlFor="program-select" className="text-sm font-medium">
              Filter by Program
            </Label>
            <select
              id="program-select"
              value={selectedProgram}
              onChange={handleProgramChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {programs.map((program) => (
                <option key={program.value} value={program.value}>
                  {program.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort By Radio Buttons */}
        <div className="mt-4">
          <Label htmlFor="sort-options" className="text-sm font-medium">
            Sort By
          </Label>
          <div id="sort-options" className="flex gap-4 mt-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="sortBy"
                value="courseId"
                checked={sortBy === "courseId"}
                onChange={handleSortChange}
                className="form-radio text-blue-500"
              />
              <span>Course ID</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="sortBy"
                value="block"
                checked={sortBy === "block"}
                onChange={handleSortChange}
                className="form-radio text-blue-500"
              />
              <span>Block</span>
            </label>
          </div>
        </div>
      </form>
      
      {isLoading && (
        <div className="mt-8 text-center">Loading courses...</div>
      )}
      
      {error && (
        <div className="mt-8 text-center text-red-500">{error}</div>
      )}
      
      {!isLoading && !error && !table && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Enter a search term to find Colorado College courses
        </div>
      )}
      
      {!isLoading && !error && filteredRows.length > 0 && (
        <>
          <div id="course-table" className="mt-8 overflow-x-auto w-full">
            <div className="w-full align-middle">
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="w-full table-auto divide-y divide-gray-200">
                  <thead>
                    {headerRow && (
                      <tr dangerouslySetInnerHTML={{ __html: headerRow.innerHTML }} />
                    )}
                  </thead>
                  <tbody dangerouslySetInnerHTML={{ __html: currentPageHTML }} />
                </table>
              </div>
            </div>
          </div>
          
          {/* No results message */}
          {dataRows.length === 0 && (searchTerm.trim() !== '' || selectedTerm !== 'all' || selectedBlock !== 'all' || selectedProgram !== 'all') && (
            <div className="mt-4 text-center text-sm text-gray-500">
              No courses found matching your search criteria. Try different keywords or filters.
            </div>
          )}
          
          {/* Results count */}
          {dataRows.length > 0 && (
            <div className="mt-4 text-sm text-gray-700 text-center">
              Found <span className="font-medium">{dataRows.length}</span> courses
              {selectedTerm !== 'all' && ` in ${terms.find(t => t.value === selectedTerm)?.label}`}
              {selectedBlock !== 'all' && ` during ${blocks.find(b => b.value === selectedBlock)?.label}`}
              {selectedProgram !== 'all' && ` in ${programs.find(p => p.value === selectedProgram)?.label}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          )}
          
          {/* Pagination - only show if we have data rows */}
          {dataRows.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{Math.min(dataRows.length, 1 + (currentPage - 1) * rowsPerPage)}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * rowsPerPage, dataRows.length)}
                </span>{' '}
                of <span className="font-medium">{dataRows.length}</span> courses
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    // Create a window of 5 page buttons centered around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={currentPage === pageNum ? "bg-blue-500 text-white" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
