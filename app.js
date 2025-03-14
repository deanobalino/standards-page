document.addEventListener('DOMContentLoaded', () => {
    // Global variables
    let standards = [];
    let currentSort = { field: 'identifier', direction: 'asc' };
    let filters = {
        search: '',
        category: 'all',
        bigRock: 'all',
        mandatory: 'all',
        date: 'all',
        detailSearch: '' // New filter for detailed standards search
    };
    
    // Collections for filter options
    let categories = [];
    let bigRocks = [];

    // Fetch and parse the YAML file
    fetch('standards.yml')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(yamlText => {
            try {
                const data = jsyaml.load(yamlText);
                standards = data.standards || [];
                
                // Extract unique filter options
                extractFilterOptions();
                
                // Initialize the page
                initializeFilters();
                renderTable();
                renderDetailedStandards();
                setupEventListeners();
            } catch (error) {
                console.error('Error parsing YAML:', error);
                showError('Failed to parse standards data. Please check if the YAML format is correct.');
            }
        })
        .catch(error => {
            console.error('Error loading standards:', error);
            showError('Failed to load standards data. Please check if the file exists and the server is running.');
        });

    // Extract unique filter options from standards
    function extractFilterOptions() {
        // Extract categories
        categories = [...new Set(standards.map(standard => standard.category))].filter(Boolean);
        
        // Extract big rocks
        const allBigRocks = standards
            .flatMap(standard => standard.big_rocks || [])
            .filter(Boolean);
        bigRocks = [...new Set(allBigRocks)];
    }

    // Show error message
    function showError(message) {
        const tableBody = document.querySelector('#standardsTable tbody');
        tableBody.innerHTML = `
            <tr><td colspan="5" class="px-6 py-4 text-center text-red-500">
                <svg class="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                ${message}
            </td></tr>
        `;
        
        document.getElementById('standardsDetail').innerHTML = `
            <div class="bg-red-50 border-l-4 border-red-400 p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-red-700">${message}</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Initialize filter dropdowns
    function initializeFilters() {
        // Populate category filter
        const categoryFilter = document.getElementById('categoryFilter');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = formatLabel(category);
            categoryFilter.appendChild(option);
        });
        
        // Populate big rock filter
        const bigRockFilter = document.getElementById('bigRockFilter');
        bigRocks.forEach(bigRock => {
            const option = document.createElement('option');
            option.value = bigRock;
            option.textContent = formatLabel(bigRock);
            bigRockFilter.appendChild(option);
        });
    }

    // Render the standards table
    function renderTable() {
        const tableBody = document.querySelector('#standardsTable tbody');
        tableBody.innerHTML = '';
        
        // Filter and sort standards
        const filteredStandards = filterStandards(standards);
        const sortedStandards = sortStandards(filteredStandards);
        
        if (sortedStandards.length === 0) {
            tableBody.innerHTML = `
                <tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    <svg class="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    No standards found matching your criteria.
                </td></tr>
            `;
            return;
        }
        
        // Create table rows
        sortedStandards.forEach(standard => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', standard.identifier);
            row.className = 'hover:bg-gray-50';
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${standard.identifier}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${standard.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        ${formatLabel(standard.category)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${standard.mandatory ? 
                        '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Mandatory</span>' : 
                        '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Encouraged</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(standard.effective_date)}</td>
            `;
            
            row.addEventListener('click', () => {
                // Scroll to the detailed view of this standard
                const detailElement = document.getElementById(`standard-${standard.identifier}`);
                if (detailElement) {
                    detailElement.scrollIntoView({ behavior: 'smooth' });
                    highlightElement(detailElement);
                }
            });
            
            tableBody.appendChild(row);
        });
        
        // Update table headers to show sort direction
        updateTableHeaders();
        
        // Update active filters display
        updateActiveFilters();
    }

    // Update the active filters display
    function updateActiveFilters() {
        const activeFiltersContainer = document.getElementById('activeFilters');
        activeFiltersContainer.innerHTML = '';
        
        // Add filter badges
        if (filters.search) {
            addFilterBadge('Search', filters.search);
        }
        
        if (filters.category !== 'all') {
            addFilterBadge('Category', formatLabel(filters.category));
        }
        
        if (filters.bigRock !== 'all') {
            addFilterBadge('Big Rock', formatLabel(filters.bigRock));
        }
        
        if (filters.mandatory !== 'all') {
            addFilterBadge('Status', filters.mandatory === 'true' ? 'Mandatory' : 'Encouraged');
        }
        
        if (filters.date !== 'all') {
            const dateLabels = {
                'upcoming': 'Upcoming',
                'current': 'Current'
            };
            addFilterBadge('Date', dateLabels[filters.date]);
        }
        
        // Helper function to add a filter badge
        function addFilterBadge(type, value) {
            const badge = document.createElement('span');
            badge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800';
            badge.innerHTML = `
                ${type}: ${value}
                <button type="button" class="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:text-indigo-600 focus:outline-none" data-filter-type="${type.toLowerCase()}">
                    <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            `;
            
            // Add click handler to remove this filter
            badge.querySelector('button').addEventListener('click', (e) => {
                const filterType = e.currentTarget.getAttribute('data-filter-type');
                clearFilter(filterType);
                e.stopPropagation();
            });
            
            activeFiltersContainer.appendChild(badge);
        }
    }

    // Clear a specific filter
    function clearFilter(filterType) {
        switch (filterType) {
            case 'search':
                document.getElementById('searchInput').value = '';
                filters.search = '';
                break;
            case 'category':
                document.getElementById('categoryFilter').value = 'all';
                filters.category = 'all';
                break;
            case 'big':
            case 'rock':
            case 'big rock':
                document.getElementById('bigRockFilter').value = 'all';
                filters.bigRock = 'all';
                break;
            case 'status':
                document.getElementById('mandatoryFilter').value = 'all';
                filters.mandatory = 'all';
                break;
            case 'date':
                document.getElementById('dateFilter').value = 'all';
                filters.date = 'all';
                break;
        }
        
        renderTable();
        renderDetailedStandards();
    }

    // Render detailed standards
    function renderDetailedStandards() {
        const detailContainer = document.getElementById('standardsDetail');
        detailContainer.innerHTML = '';
        
        // Filter standards using both main filters and detail search filter
        const filteredStandards = filterDetailedStandards(filterStandards(standards));
        
        if (filteredStandards.length === 0) {
            detailContainer.innerHTML = `
                <div class="rounded-md bg-blue-50 p-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3 flex-1 md:flex md:justify-between">
                            <p class="text-sm text-blue-700">No standards found matching your criteria.</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        // Create detailed view for each standard
        filteredStandards.forEach(standard => {
            const detailElement = document.createElement('div');
            detailElement.className = 'standard-detail';
            detailElement.id = `standard-${standard.identifier}`;
            
            // Create the header section
            const headerHtml = `
                <div class="standard-detail-header">
                    <h3>
                        ${standard.name}
                        ${standard.mandatory ? 
                            '<span class="badge badge-success">Mandatory</span>' : 
                            '<span class="badge badge-warning">Encouraged</span>'}
                    </h3>
                    <div class="metadata">
                        <span class="badge badge-primary">${standard.identifier}</span>
                        <span class="badge badge-secondary">${formatLabel(standard.category)}</span>
                        <span class="badge badge-info">Effective: ${formatDate(standard.effective_date)}</span>
                    </div>
                </div>
            `;
            
            // Create the body section
            let bodyHtml = `
                <div class="standard-detail-body">
                    <div class="description">
                        <p>${standard.description}</p>
                    </div>
            `;
            
            // Add sections for lists
            // Applicability section
            if (standard.applicability && standard.applicability.length > 0) {
                bodyHtml += createListSection('Applicability', standard.applicability);
            }
            
            // Big Rocks section
            if (standard.big_rocks && standard.big_rocks.length > 0) {
                bodyHtml += createListSection('Big Rocks', standard.big_rocks, true);
            }
            
            // Criteria section
            if (standard.criteria && standard.criteria.length > 0) {
                bodyHtml += createListSection('Criteria', standard.criteria);
            }
            
            // Rationale section
            if (standard.rationale && standard.rationale.length > 0) {
                bodyHtml += createListSection('Rationale', standard.rationale);
            }
            
            // Outstanding Questions section
            if (standard.outstanding_questions && standard.outstanding_questions.length > 0) {
                bodyHtml += createListSection('Outstanding Questions', standard.outstanding_questions);
            }
            
            bodyHtml += '</div>'; // Close standard-detail-body
            
            // Combine all sections
            detailElement.innerHTML = headerHtml + bodyHtml;
            detailContainer.appendChild(detailElement);
        });
    }

    // Helper function to create a list section
    function createListSection(title, items, isFilterable = false) {
        let itemsHtml = '';
        items.forEach(item => {
            if (isFilterable) {
                // For filterable items like big rocks, add a clickable link
                itemsHtml += `<li><a href="#" class="text-indigo-600 hover:text-indigo-900" data-filter-value="${item}">${item}</a></li>`;
            } else {
                itemsHtml += `<li>${item}</li>`;
            }
        });
        
        return `
            <div class="section">
                <h4>${title}</h4>
                <ul>${itemsHtml}</ul>
            </div>
        `;
    }

    // Set up event listeners
    function setupEventListeners() {
        // Table header click for sorting
        document.querySelectorAll('#standardsTable th[data-sort]').forEach(header => {
            header.addEventListener('click', () => {
                const field = header.getAttribute('data-sort');
                
                // Toggle sort direction if clicking the same header
                if (currentSort.field === field) {
                    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSort.field = field;
                    currentSort.direction = 'asc';
                }
                
                renderTable();
            });
        });
        
        // Search input with debounce
        const searchInput = document.getElementById('searchInput');
        let debounceTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                filters.search = e.target.value.toLowerCase();
                renderTable();
                renderDetailedStandards();
            }, 300); // 300ms debounce
        });
        
        // Clear search with Escape key
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                filters.search = '';
                renderTable();
                renderDetailedStandards();
            }
        });
        
        // Detail search input with debounce
        const detailSearchInput = document.getElementById('detailSearchInput');
        let detailDebounceTimeout;
        
        if (detailSearchInput) {
            detailSearchInput.addEventListener('input', (e) => {
                clearTimeout(detailDebounceTimeout);
                detailDebounceTimeout = setTimeout(() => {
                    filters.detailSearch = e.target.value.toLowerCase();
                    renderDetailedStandards();
                }, 300); // 300ms debounce
            });
            
            // Clear detail search with Escape key
            detailSearchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Escape') {
                    detailSearchInput.value = '';
                    filters.detailSearch = '';
                    renderDetailedStandards();
                }
            });
        }
        
        // Category filter change
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            filters.category = e.target.value;
            renderTable();
            renderDetailedStandards();
        });
        
        // Big Rock filter change
        document.getElementById('bigRockFilter').addEventListener('change', (e) => {
            filters.bigRock = e.target.value;
            renderTable();
            renderDetailedStandards();
        });
        
        // Mandatory filter change
        document.getElementById('mandatoryFilter').addEventListener('change', (e) => {
            filters.mandatory = e.target.value;
            renderTable();
            renderDetailedStandards();
        });
        
        // Date filter change
        document.getElementById('dateFilter').addEventListener('change', (e) => {
            filters.date = e.target.value;
            renderTable();
            renderDetailedStandards();
        });
        
        // Clear all filters button
        document.getElementById('clearFilters').addEventListener('click', () => {
            // Reset all filters
            document.getElementById('searchInput').value = '';
            document.getElementById('categoryFilter').value = 'all';
            document.getElementById('bigRockFilter').value = 'all';
            document.getElementById('mandatoryFilter').value = 'all';
            document.getElementById('dateFilter').value = 'all';
            
            // Also clear the detail search if it exists
            const detailSearchInput = document.getElementById('detailSearchInput');
            if (detailSearchInput) {
                detailSearchInput.value = '';
            }
            
            filters = {
                search: '',
                category: 'all',
                bigRock: 'all',
                mandatory: 'all',
                date: 'all',
                detailSearch: ''
            };
            
            renderTable();
            renderDetailedStandards();
            updateActiveFilters();
        });
        
        // Clickable big rocks in detailed view
        document.addEventListener('click', (e) => {
            if (e.target.matches('.section a[data-filter-value]')) {
                e.preventDefault();
                const value = e.target.getAttribute('data-filter-value');
                document.getElementById('bigRockFilter').value = value;
                filters.bigRock = value;
                renderTable();
                renderDetailedStandards();
                window.scrollTo(0, 0);
            }
        });
    }

    // Filter standards based on all active filters
    function filterStandards(standardsList) {
        return standardsList.filter(standard => {
            // Category filter
            const categoryMatch = filters.category === 'all' || standard.category === filters.category;
            
            // Big Rock filter
            const bigRockMatch = filters.bigRock === 'all' || 
                (standard.big_rocks && standard.big_rocks.includes(filters.bigRock));
            
            // Mandatory filter
            const mandatoryMatch = filters.mandatory === 'all' || 
                String(standard.mandatory) === filters.mandatory;
            
            // Date filter
            let dateMatch = true;
            if (filters.date !== 'all') {
                const today = new Date();
                const effectiveDate = new Date(standard.effective_date);
                
                switch (filters.date) {
                    case 'upcoming':
                        dateMatch = effectiveDate > today;
                        break;
                    case 'current':
                        // Within 30 days before or after today
                        const thirtyDaysAgo = new Date(today);
                        thirtyDaysAgo.setDate(today.getDate() - 30);
                        const thirtyDaysFromNow = new Date(today);
                        thirtyDaysFromNow.setDate(today.getDate() + 30);
                        dateMatch = effectiveDate >= thirtyDaysAgo && effectiveDate <= thirtyDaysFromNow;
                        break;
                }
            }
            
            // Search term filter
            let searchMatch = true;
            if (filters.search) {
                // Search in multiple fields
                const searchFields = [
                    standard.identifier,
                    standard.name,
                    standard.description,
                    standard.category,
                    ...(standard.applicability || []),
                    ...(standard.big_rocks || []),
                    ...(standard.criteria || []),
                    ...(standard.rationale || []),
                    ...(standard.outstanding_questions || [])
                ];
                
                searchMatch = searchFields.some(field => 
                    field && field.toString().toLowerCase().includes(filters.search)
                );
            }
            
            return categoryMatch && bigRockMatch && mandatoryMatch && dateMatch && searchMatch;
        });
    }

    // Sort standards based on current sort field and direction
    function sortStandards(standardsList) {
        return [...standardsList].sort((a, b) => {
            let valueA = a[currentSort.field];
            let valueB = b[currentSort.field];
            
            // Handle special cases
            if (currentSort.field === 'mandatory') {
                valueA = Boolean(valueA);
                valueB = Boolean(valueB);
            } else if (currentSort.field === 'effective_date') {
                valueA = new Date(valueA || '9999-12-31').getTime();
                valueB = new Date(valueB || '9999-12-31').getTime();
            }
            
            // Handle null or undefined values
            if (valueA === null || valueA === undefined) valueA = '';
            if (valueB === null || valueB === undefined) valueB = '';
            
            // Compare values
            if (valueA < valueB) {
                return currentSort.direction === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return currentSort.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    // Update table headers to show sort direction
    function updateTableHeaders() {
        document.querySelectorAll('#standardsTable th[data-sort]').forEach(header => {
            const field = header.getAttribute('data-sort');
            const icon = header.querySelector('svg');
            
            // Remove active class from all headers
            header.classList.remove('active', 'asc', 'desc');
            
            // Update icon based on sort direction
            if (field === currentSort.field) {
                header.classList.add('active', currentSort.direction);
            }
        });
    }

    // Helper function to format category labels
    function formatLabel(text) {
        if (!text) return 'Uncategorized';
        return text
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Helper function to format dates
    function formatDate(dateString) {
        if (!dateString) return 'Not set';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Helper function to highlight an element briefly
    function highlightElement(element) {
        element.classList.add('highlight');
        
        setTimeout(() => {
            element.classList.remove('highlight');
        }, 2000);
    }

    // Filter detailed standards
    function filterDetailedStandards(standardsList) {
        return standardsList.filter(standard => {
            // Search term filter
            let searchMatch = true;
            if (filters.detailSearch) {
                // Search in multiple fields
                const searchFields = [
                    standard.identifier,
                    standard.name,
                    standard.description,
                    standard.category,
                    ...(standard.applicability || []),
                    ...(standard.big_rocks || []),
                    ...(standard.criteria || []),
                    ...(standard.rationale || []),
                    ...(standard.outstanding_questions || [])
                ];
                
                searchMatch = searchFields.some(field => 
                    field && field.toString().toLowerCase().includes(filters.detailSearch)
                );
            }
            
            return searchMatch;
        });
    }
}); 