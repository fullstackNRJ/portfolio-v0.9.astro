console.log("Loaded v2...");

const searchInput = document.querySelector("[search-input]");

const locationdropdown = document.querySelector("[dd-location-select]");
const locationdropdownLabel = document.querySelector("[dd-location-label]");
const locationDropdownList = document.querySelector("[dd-location-list]");
const dropdownOption = document.querySelector("[dd-location-option]");

const departmentDropdown = document.querySelector("[dd-department-select]");
const departmentDropdownLabel = document.querySelector("[dd-department-label]");
const departmentDropdownList = document.querySelector("[dd-department-list]");
const departmentDropdownOption = document.querySelector(
    "[dd-department-option]"
);

const jobTypesDropdown = document.querySelector("[dd-jobtypes-select]");
const jobTypesDropdownLabel = document.querySelector("[dd-jobtypes-label]");
const jobTypesDropdownList = document.querySelector("[dd-jobtypes-list]");
const jobTypesDropdownOption = document.querySelector("[dd-jobtypes-option]");

const openingsList = document.querySelector("[openings-list]");
const sampleOpeningCard = document.querySelector("[openings-item]");
const viewMoreBtn = document.querySelector("[action-btn=view-all-jobs]");

const selectors = {
    title: "[opening-title]",
    location: "[opening-location]",
    publishdate: "[opening-publishdate]",
    jobType: "[opening-jobtype]",
    applyLink: "[action-btn=apply-btn]",
};

let allJobs = [];
let filteredJobs = [];
let jobsRenderedCount = 0;
let jobsToShow = [];
let selectedLocations = new Set();
let selectedDepartments = new Set();
let selectedWorkplaceTypes = new Set();
const jobsPerPage = 5;

//const WORKABLE_TOKEN = 'S5e9o1zWNJKiuPG0byPIgVUdSbYWS1fGq9OMBgZjLY8';

const options = {
    method: "GET",
    headers: {
        accept: "application/json",
        //Authorization: `Bearer ${WORKABLE_TOKEN}`
    },
};

function fetchJobs() {
    fetch(
        "https://rooommaster.netlify.app/.netlify/functions/getJobs?limit=100",
        options
    )
        .then((res) => res.json())
        .then((res) => {
            allJobs = res.jobs;
            jobsToShow = allJobs.filter(
                (job) => job.department_hierarchy?.[0]?.name === "InnQuest Software"
            );

            /*  if (jobsToShow.length === 0) {
                 jobsToShow = allJobs;
             } */

            // Compute unique sets for InnQuest Software jobs
            const uniqueLocations = new Set();
            const uniqueDepartments = new Set();
            const uniqueWorkplaceTypes = new Set();

            jobsToShow.forEach(job => {
                uniqueLocations.add(job.location.location_str);
                job.department_hierarchy.forEach(dep => uniqueDepartments.add(dep.name));
                uniqueWorkplaceTypes.add(job.workplace_type);
            });

            // Populate dropdowns using cloned options
            locationDropdownList.innerHTML = '';
            departmentDropdownList.innerHTML = '';
            jobTypesDropdownList.innerHTML = '';

            uniqueLocations.forEach(loc => {
                const option = dropdownOption.cloneNode(true);
                const textElement = option.querySelector('span') || option; // Adjust if your text is in another element
                textElement.textContent = loc;
                option.setAttribute('data-value', loc);

                option.addEventListener('click', () => {
                    const isChecked = option.classList.toggle('w--redirected-checked');
                    if (isChecked) {
                        selectedLocations.add(loc);
                    } else {
                        selectedLocations.delete(loc);
                    }
                    applyFilters();
                });
                locationDropdownList.appendChild(option);
            });

            uniqueDepartments.forEach(dep => {
                const option = departmentDropdownOption.cloneNode(true);
                const textElement = option.querySelector('span') || option;
                textElement.textContent = dep;
                option.setAttribute('data-value', dep);

                option.addEventListener('click', () => {
                    const isChecked = option.classList.toggle('w--redirected-checked');
                    if (isChecked) {
                        selectedDepartments.add(dep);
                    } else {
                        selectedDepartments.delete(dep);
                    }
                    applyFilters();
                });
                departmentDropdownList.appendChild(option);
            });

            uniqueWorkplaceTypes.forEach(type => {
                const option = jobTypesDropdownOption.cloneNode(true);
                const textElement = option.querySelector('span') || option;
                textElement.textContent = type;
                option.setAttribute('data-value', type);

                option.addEventListener('click', () => {
                    const isChecked = option.classList.toggle('w--redirected-checked');
                    if (isChecked) {
                        selectedWorkplaceTypes.add(type);
                    } else {
                        selectedWorkplaceTypes.delete(type);
                    }
                    applyFilters();
                });
                jobTypesDropdownList.appendChild(option);
            });

            // Add event listeners for updating labels on selection (if needed)
            locationDropdownList.addEventListener('click', (e) => {
                const option = e.target.closest('[dd-location-option]');
                if (option) {
                    locationdropdownLabel.textContent = option.getAttribute('data-value');
                }
            });

            departmentDropdownList.addEventListener('click', (e) => {
                const option = e.target.closest('[dd-department-option]');
                if (option) {
                    departmentDropdownLabel.textContent = option.getAttribute('data-value');
                }
            });

            jobTypesDropdownList.addEventListener('click', (e) => {
                const option = e.target.closest('[dd-jobtypes-option]');
                if (option) {
                    jobTypesDropdownLabel.textContent = option.getAttribute('data-value');
                }
            });

            // Initial filter application
            applyFilters();
        })
        .catch((err) => console.error(err));
}

function renderMoreJobs() {
    const jobsToRender = filteredJobs.slice(
        jobsRenderedCount,
        jobsRenderedCount + jobsPerPage
    );
    renderJobListings(jobsToRender);
    jobsRenderedCount += jobsToRender.length;

    if (jobsRenderedCount >= filteredJobs.length) {
        viewMoreBtn.style.display = "none";
    } else {
        viewMoreBtn.style.display = "block";
    }
}

function applyFilters() {
    let filtered = jobsToShow.filter(job => {
        // Location filter
        if (selectedLocations.size > 0 && !selectedLocations.has(job.location.location_str)) {
            return false;
        }
        // Department filter
        if (selectedDepartments.size > 0) {
            const hasDep = job.department_hierarchy.some(dep => selectedDepartments.has(dep.name));
            if (!hasDep) return false;
        }
        // Workplace type filter
        if (selectedWorkplaceTypes.size > 0 && !selectedWorkplaceTypes.has(job.workplace_type)) {
            return false;
        }
        return true;
    });
    filteredJobs = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    openingsList.innerHTML = "";
    jobsRenderedCount = 0;
    renderMoreJobs();
}

function renderJobListings(jobs) {
    jobs.forEach((job) => {
        const newOpening = sampleOpeningCard.cloneNode(true);
        newOpening.style.display = "block";
        newOpening.querySelector(selectors.title).textContent = job.title;
        newOpening.querySelector(selectors.location).textContent = [
            job.location.city,
            job.location.country,
        ]
            .filter(Boolean)
            .join(", ");
        newOpening.querySelector(selectors.publishdate).textContent = timeAgo(
            job.created_at
        );
        newOpening.querySelector(selectors.jobType).textContent =
            job.workplace_type?.replace('on_site', 'On site')?.replace('remote', 'Remote')?.replace('hybrid', 'Hybrid');
        newOpening.querySelector(selectors.applyLink).onclick = () =>
            window.open(job.url, "_blank");
        openingsList.appendChild(newOpening);
    });
}

function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const weeks = Math.round(days / 7);
    const months = Math.round(days / 30.44); // Average days in a month
    const years = Math.round(days / 365.25); // Average days in a year

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    if (weeks < 5) return `${weeks} weeks ago`;
    if (months < 12) return `${months} months ago`;
    return `${years} years ago`;
}

document.addEventListener("DOMContentLoaded", fetchJobs);
viewMoreBtn.addEventListener("click", renderMoreJobs);



const sampleJObs = {
    "jobs": [
        {
            "id": "4257ab",
            "title": "Ingénieur logiciel senior - Senior Software Engineer",
            "full_title": "Ingénieur logiciel senior - Senior Software Engineer - HR-22425",
            "shortcode": "0E800E65F7",
            "code": "HR-22425",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Professional Services",
            "department_hierarchy": [
                {
                    "id": 438952,
                    "name": "Irosoft"
                },
                {
                    "id": 438960,
                    "name": "Professional Services"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4346585",
            "application_url": "https://valsoft-corp.workable.com/jobs/4346585/candidates/new",
            "shortlink": "https://apply.workable.com/j/0E800E65F7",
            "workplace_type": "remote",
            "location": {
                "location_str": "Quebec, Canada",
                "country": "Canada",
                "country_code": "CA",
                "region": "Quebec",
                "region_code": "QC",
                "city": null,
                "zip_code": null,
                "telecommuting": true,
                "workplace_type": "remote"
            },
            "locations": [
                {
                    "shortcode": "J06CDBB6B32",
                    "country_code": "CA",
                    "country_name": "Canada",
                    "state_code": "QC",
                    "subregion": "Quebec",
                    "zip_code": null,
                    "city": "",
                    "coords": "52.9399159, -73.5491361",
                    "hidden": false
                }
            ],
            "salary": {
                "salary_currency": "cad"
            },
            "created_at": "2024-10-03T10:59:20Z"
        },
        {
            "id": "45da26",
            "title": "Sales Manager",
            "full_title": "Sales Manager - 24888",
            "shortcode": "08A0516C62",
            "code": "24888",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Sales",
            "department_hierarchy": [
                {
                    "id": 439204,
                    "name": "Telematel"
                },
                {
                    "id": 439213,
                    "name": "Sales"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4576596",
            "application_url": "https://valsoft-corp.workable.com/jobs/4576596/candidates/new",
            "shortlink": "https://apply.workable.com/j/08A0516C62",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Barcelona, Catalonia, Spain",
                "country": "Spain",
                "country_code": "ES",
                "region": "Catalonia",
                "region_code": "CT",
                "city": "Barcelona",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "J3ED4CB47CB",
                    "country_code": "ES",
                    "country_name": "Spain",
                    "state_code": "CT",
                    "subregion": "Catalonia",
                    "zip_code": null,
                    "city": "Barcelona",
                    "coords": "41.38506389999999, 2.1734034999999494",
                    "hidden": false
                }
            ],
            "created_at": "2025-01-15T06:12:13Z"
        },
        {
            "id": "45e8d2",
            "title": "UX/UI Designer",
            "full_title": "UX/UI Designer - HR - 25888 Fluent",
            "shortcode": "68E62714F4",
            "code": "HR - 25888 Fluent",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4580352",
            "application_url": "https://valsoft-corp.workable.com/jobs/4580352/candidates/new",
            "shortlink": "https://apply.workable.com/j/68E62714F4",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "J751C867596",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-01-16T12:28:08Z"
        },
        {
            "id": "460572",
            "title": "Business Analyst",
            "full_title": "Business Analyst - United States",
            "shortcode": "E12F9E1005",
            "code": null,
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": null,
            "department_hierarchy": [],
            "url": "https://valsoft-corp.workable.com/jobs/4587680",
            "application_url": "https://valsoft-corp.workable.com/jobs/4587680/candidates/new",
            "shortlink": "https://apply.workable.com/j/E12F9E1005",
            "workplace_type": "remote",
            "location": {
                "location_str": "Washington, United States",
                "country": "United States",
                "country_code": "US",
                "region": "Washington",
                "region_code": "WA",
                "city": null,
                "zip_code": null,
                "telecommuting": true,
                "workplace_type": "remote"
            },
            "locations": [
                {
                    "shortcode": "JE72E8727E3",
                    "country_code": "US",
                    "country_name": "United States",
                    "state_code": "WA",
                    "subregion": "Washington",
                    "zip_code": null,
                    "city": "",
                    "coords": "47.7510741, -120.7401386",
                    "hidden": false
                }
            ],
            "salary": {
                "salary_from": 78000,
                "salary_to": 85000,
                "salary_currency": "usd"
            },
            "created_at": "2025-01-20T19:23:01Z"
        },
        {
            "id": "46f329",
            "title": "Contrôleur | Controller",
            "full_title": "Contrôleur | Controller - HR-25424",
            "shortcode": "FE1D30A655",
            "code": "HR-25424",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Finances | Finance",
            "department_hierarchy": [
                {
                    "id": 342000,
                    "name": "Valsoft"
                },
                {
                    "id": 342723,
                    "name": "Finances | Finance"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4648535",
            "application_url": "https://valsoft-corp.workable.com/jobs/4648535/candidates/new",
            "shortlink": "https://apply.workable.com/j/FE1D30A655",
            "workplace_type": "hybrid",
            "location": {
                "location_str": "Montreal, Quebec, Canada",
                "country": "Canada",
                "country_code": "CA",
                "region": "Quebec",
                "region_code": "QC",
                "city": "Montreal",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "hybrid"
            },
            "locations": [
                {
                    "shortcode": "JA4885659A6",
                    "country_code": "CA",
                    "country_name": "Canada",
                    "state_code": "QC",
                    "subregion": "Quebec",
                    "zip_code": null,
                    "city": "Montreal",
                    "coords": "45.5016889, -73.56725599999999",
                    "hidden": false
                }
            ],
            "created_at": "2025-02-13T17:11:33Z"
        },
        {
            "id": "4775d4",
            "title": "Full Stack Engineer - NodeJS/ API / AWS",
            "full_title": "Full Stack Engineer - NodeJS/ API / AWS - HR-27674 Dig Cur",
            "shortcode": "CA1E7AFE74",
            "code": "HR-27674 Dig Cur",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4681986",
            "application_url": "https://valsoft-corp.workable.com/jobs/4681986/candidates/new",
            "shortlink": "https://apply.workable.com/j/CA1E7AFE74",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "J49F5010EDF",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-02-26T16:34:16Z"
        },
        {
            "id": "4799ab",
            "title": "Finance Manager",
            "full_title": "Finance Manager - 333",
            "shortcode": "E4BDAB71AF",
            "code": "333",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Finances | Finance",
            "department_hierarchy": [
                {
                    "id": 342000,
                    "name": "Valsoft"
                },
                {
                    "id": 342723,
                    "name": "Finances | Finance"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4691161",
            "application_url": "https://valsoft-corp.workable.com/jobs/4691161/candidates/new",
            "shortlink": "https://apply.workable.com/j/E4BDAB71AF",
            "workplace_type": "hybrid",
            "location": {
                "location_str": "Montreal, Quebec, Canada",
                "country": "Canada",
                "country_code": "CA",
                "region": "Quebec",
                "region_code": "QC",
                "city": "Montreal",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "hybrid"
            },
            "locations": [
                {
                    "shortcode": "J63BEA38097",
                    "country_code": "CA",
                    "country_name": "Canada",
                    "state_code": "QC",
                    "subregion": "Quebec",
                    "zip_code": null,
                    "city": "Montreal",
                    "coords": "45.5016889, -73.56725599999999",
                    "hidden": false
                },
                {
                    "shortcode": "J718703AD61",
                    "country_code": "CA",
                    "country_name": "Canada",
                    "state_code": "ON",
                    "subregion": "Ontario",
                    "zip_code": null,
                    "city": "Toronto",
                    "coords": "43.653226, -79.38318429999998",
                    "hidden": false
                }
            ],
            "salary": {
                "salary_currency": "cad"
            },
            "created_at": "2025-03-03T13:36:12Z"
        },
        {
            "id": "47b0f5",
            "title": "Data Operations Engineer",
            "full_title": "Data Operations Engineer - Dublin",
            "shortcode": "B61B85C1C5",
            "code": null,
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Recherche et Développement | Research & Development",
            "department_hierarchy": [
                {
                    "id": 342000,
                    "name": "Valsoft"
                },
                {
                    "id": 418951,
                    "name": "Recherche et Développement | Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4697123",
            "application_url": "https://valsoft-corp.workable.com/jobs/4697123/candidates/new",
            "shortlink": "https://apply.workable.com/j/B61B85C1C5",
            "workplace_type": "hybrid",
            "location": {
                "location_str": "Dublin, County Dublin, Ireland",
                "country": "Ireland",
                "country_code": "IE",
                "region": "County Dublin",
                "region_code": "D",
                "city": "Dublin",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "hybrid"
            },
            "locations": [
                {
                    "shortcode": "JB8EC2B823A",
                    "country_code": "IE",
                    "country_name": "Ireland",
                    "state_code": "D",
                    "subregion": "County Dublin",
                    "zip_code": null,
                    "city": "Dublin",
                    "coords": "53.3498053, -6.2603097",
                    "hidden": false
                }
            ],
            "created_at": "2025-03-05T09:42:03Z"
        },
        {
            "id": "481113",
            "title": "Junior - Mid - Senior - Software Developer - Artificial Intelligence",
            "full_title": "Junior - Mid - Senior - Software Developer - Artificial Intelligence - Beirut",
            "shortcode": "5D33166D2D",
            "code": null,
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4721729",
            "application_url": "https://valsoft-corp.workable.com/jobs/4721729/candidates/new",
            "shortlink": "https://apply.workable.com/j/5D33166D2D",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "J255BEAF421",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-03-14T06:25:05Z"
        },
        {
            "id": "4857bf",
            "title": "AI Software Developer",
            "full_title": "AI Software Developer - HR-29246",
            "shortcode": "E17DB15947",
            "code": "HR-29246",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4739821",
            "application_url": "https://valsoft-corp.workable.com/jobs/4739821/candidates/new",
            "shortlink": "https://apply.workable.com/j/E17DB15947",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "J343254AE8F",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-03-20T11:06:04Z"
        },
        {
            "id": "486388",
            "title": "Senior Software Developer - NodeJS/Python/ AWS /Prompt engineering",
            "full_title": "Senior Software Developer - NodeJS/Python/ AWS /Prompt engineering - HR 29907 Valp",
            "shortcode": "85C4278035",
            "code": "HR 29907 Valp",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4742838",
            "application_url": "https://valsoft-corp.workable.com/jobs/4742838/candidates/new",
            "shortlink": "https://apply.workable.com/j/85C4278035",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "JD348A682C5",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-03-21T11:21:06Z"
        },
        {
            "id": "48e4af",
            "title": "FullStack Developer - .Net ,angular/react , VB6, AI",
            "full_title": "FullStack Developer - .Net ,angular/react , VB6, AI - HR-30107 Cott",
            "shortcode": "D83933F7DF",
            "code": "HR-30107 Cott",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4775901",
            "application_url": "https://valsoft-corp.workable.com/jobs/4775901/candidates/new",
            "shortlink": "https://apply.workable.com/j/D83933F7DF",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "J90BFB9D39C",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-04-04T15:32:48Z"
        },
        {
            "id": "48ec21",
            "title": "Senior Software Developer - C# - WPF -MVVM -AI",
            "full_title": "Senior Software Developer - C# - WPF -MVVM -AI - HR - 30518 Dig Curr",
            "shortcode": "88B79ED2FC",
            "code": "HR - 30518 Dig Curr",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4777807",
            "application_url": "https://valsoft-corp.workable.com/jobs/4777807/candidates/new",
            "shortlink": "https://apply.workable.com/j/88B79ED2FC",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "J46F3CC8B20",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-04-07T06:53:42Z"
        },
        {
            "id": "48fa90",
            "title": "Junior Support Engineer",
            "full_title": "Junior Support Engineer - HR-30737 VSN",
            "shortcode": "DE3EB558F4",
            "code": "HR-30737 VSN",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Customer Support",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465076,
                    "name": "Customer Support"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4781502",
            "application_url": "https://valsoft-corp.workable.com/jobs/4781502/candidates/new",
            "shortlink": "https://apply.workable.com/j/DE3EB558F4",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "JD0DD23D5DE",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-04-08T12:32:10Z"
        },
        {
            "id": "4938bf",
            "title": "Senior .NET Software Developer",
            "full_title": "Senior .NET Software Developer - HR -30984 Innq",
            "shortcode": "5A8AB0E04B",
            "code": "HR -30984 Innq",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4797421",
            "application_url": "https://valsoft-corp.workable.com/jobs/4797421/candidates/new",
            "shortlink": "https://apply.workable.com/j/5A8AB0E04B",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "JF43FD9AC89",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-04-15T07:34:16Z"
        },
        {
            "id": "496a3c",
            "title": "Intermediate & Senior Java Software Developer",
            "full_title": "Intermediate & Senior Java Software Developer - HR -3100 Serv Cent",
            "shortcode": "11F2AB1B3F",
            "code": "HR -3100 Serv Cent",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4810090",
            "application_url": "https://valsoft-corp.workable.com/jobs/4810090/candidates/new",
            "shortlink": "https://apply.workable.com/j/11F2AB1B3F",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "J9CA4131688",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-04-22T08:52:05Z"
        },
        {
            "id": "49ade4",
            "title": "Node.is Software Developer",
            "full_title": "Node.is Software Developer - HR-30974",
            "shortcode": "A906F2F846",
            "code": "HR-30974",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 439304,
                    "name": "VSN"
                },
                {
                    "id": 439312,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4827410",
            "application_url": "https://valsoft-corp.workable.com/jobs/4827410/candidates/new",
            "shortlink": "https://apply.workable.com/j/A906F2F846",
            "workplace_type": "hybrid",
            "location": {
                "location_str": "Alicante, Valenciana, Comunidad / Valenciana, Comunitat, Spain",
                "country": "Spain",
                "country_code": "ES",
                "region": "Valenciana, Comunidad / Valenciana, Comunitat",
                "region_code": "VC",
                "city": "Alicante",
                "zip_code": "03000",
                "telecommuting": false,
                "workplace_type": "hybrid"
            },
            "locations": [
                {
                    "shortcode": "JC476656695",
                    "country_code": "ES",
                    "country_name": "Spain",
                    "state_code": "VC",
                    "subregion": "Valenciana, Comunidad / Valenciana, Comunitat",
                    "zip_code": "03000",
                    "city": "Alicante",
                    "coords": "38.3457685,-0.4909444",
                    "hidden": false
                }
            ],
            "salary": {
                "salary_from": 25000,
                "salary_to": 25000,
                "salary_currency": "eur"
            },
            "created_at": "2025-04-30T11:10:24Z"
        },
        {
            "id": "49c507",
            "title": "Finance Director",
            "full_title": "Finance Director - Montreal",
            "shortcode": "6D14D11D99",
            "code": null,
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Finances | Finance",
            "department_hierarchy": [
                {
                    "id": 342000,
                    "name": "Valsoft"
                },
                {
                    "id": 342723,
                    "name": "Finances | Finance"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4833333",
            "application_url": "https://valsoft-corp.workable.com/jobs/4833333/candidates/new",
            "shortlink": "https://apply.workable.com/j/6D14D11D99",
            "workplace_type": "hybrid",
            "location": {
                "location_str": "Montreal, Quebec, Canada",
                "country": "Canada",
                "country_code": "CA",
                "region": "Quebec",
                "region_code": "QC",
                "city": "Montreal",
                "zip_code": "H4T 1Z2",
                "telecommuting": false,
                "workplace_type": "hybrid"
            },
            "locations": [
                {
                    "shortcode": "JD2748B96FA",
                    "country_code": "CA",
                    "country_name": "Canada",
                    "state_code": "QC",
                    "subregion": "Quebec",
                    "zip_code": "H4T 1Z2",
                    "city": "Montreal",
                    "coords": "45.5016889, -73.56725599999999",
                    "hidden": false
                }
            ],
            "created_at": "2025-05-02T18:12:06Z"
        },
        {
            "id": "49e2e1",
            "title": "Senior AI Developer",
            "full_title": "Senior AI Developer - Montreal",
            "shortcode": "806F6590C0",
            "code": null,
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "IA | AI",
            "department_hierarchy": [
                {
                    "id": 342000,
                    "name": "Valsoft"
                },
                {
                    "id": 465949,
                    "name": "IA | AI"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4840975",
            "application_url": "https://valsoft-corp.workable.com/jobs/4840975/candidates/new",
            "shortlink": "https://apply.workable.com/j/806F6590C0",
            "workplace_type": "hybrid",
            "location": {
                "location_str": "Montreal, Quebec, Canada",
                "country": "Canada",
                "country_code": "CA",
                "region": "Quebec",
                "region_code": "QC",
                "city": "Montreal",
                "zip_code": "H4T 1Z2",
                "telecommuting": false,
                "workplace_type": "hybrid"
            },
            "locations": [
                {
                    "shortcode": "J044C53F3EE",
                    "country_code": "CA",
                    "country_name": "Canada",
                    "state_code": "QC",
                    "subregion": "Quebec",
                    "zip_code": "H4T 1Z2",
                    "city": "Montreal",
                    "coords": "45.5016889, -73.56725599999999",
                    "hidden": false
                }
            ],
            "created_at": "2025-05-06T15:33:29Z"
        },
        {
            "id": "49e5f1",
            "title": "Account Executive",
            "full_title": "Account Executive - HR-32087",
            "shortcode": "0146293293",
            "code": "HR-32087",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Sales",
            "department_hierarchy": [
                {
                    "id": 438983,
                    "name": "Kivuto Solutions"
                },
                {
                    "id": 438992,
                    "name": "Sales"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4841759",
            "application_url": "https://valsoft-corp.workable.com/jobs/4841759/candidates/new",
            "shortlink": "https://apply.workable.com/j/0146293293",
            "workplace_type": "remote",
            "location": {
                "location_str": "Canada",
                "country": "Canada",
                "country_code": "CA",
                "region": null,
                "region_code": null,
                "city": null,
                "zip_code": null,
                "telecommuting": true,
                "workplace_type": "remote"
            },
            "locations": [
                {
                    "shortcode": "J2A15F599A6",
                    "country_code": "CA",
                    "country_name": "Canada",
                    "state_code": "",
                    "subregion": null,
                    "zip_code": null,
                    "city": "",
                    "coords": "56.130366, -106.346771",
                    "hidden": false
                }
            ],
            "created_at": "2025-05-06T19:49:34Z"
        },
        {
            "id": "49eda8",
            "title": "Desktop Support Engineer",
            "full_title": "Desktop Support Engineer - HR-31978",
            "shortcode": "2A46A1F27B",
            "code": "HR-31978",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Professional Services",
            "department_hierarchy": [
                {
                    "id": 438657,
                    "name": "Cott Systems"
                },
                {
                    "id": 438664,
                    "name": "Professional Services"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4843734",
            "application_url": "https://valsoft-corp.workable.com/jobs/4843734/candidates/new",
            "shortlink": "https://apply.workable.com/j/2A46A1F27B",
            "workplace_type": "hybrid",
            "location": {
                "location_str": "Ohio City, Ohio, United States",
                "country": "United States",
                "country_code": "US",
                "region": "Ohio",
                "region_code": "OH",
                "city": "Ohio City",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "hybrid"
            },
            "locations": [
                {
                    "shortcode": "J4EC30C2BCB",
                    "country_code": "US",
                    "country_name": "United States",
                    "state_code": "OH",
                    "subregion": "Ohio",
                    "zip_code": null,
                    "city": "Ohio City",
                    "coords": "40.7714367, -84.6155134",
                    "hidden": false
                }
            ],
            "created_at": "2025-05-07T13:43:44Z"
        },
        {
            "id": "4a5387",
            "title": "Associé en Fusions et Acquisitions | M&A Associate",
            "full_title": "Associé en Fusions et Acquisitions | M&A Associate - Montreal",
            "shortcode": "AF621E7B2C",
            "code": null,
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Fusions et acquisitions | Mergers & Acquisitions",
            "department_hierarchy": [
                {
                    "id": 342000,
                    "name": "Valsoft"
                },
                {
                    "id": 342724,
                    "name": "Fusions et acquisitions | Mergers & Acquisitions"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4869813",
            "application_url": "https://valsoft-corp.workable.com/jobs/4869813/candidates/new",
            "shortlink": "https://apply.workable.com/j/AF621E7B2C",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Montreal, Quebec, Canada",
                "country": "Canada",
                "country_code": "CA",
                "region": "Quebec",
                "region_code": "QC",
                "city": "Montreal",
                "zip_code": "H4T 1Z2",
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "JD562BF5BDC",
                    "country_code": "CA",
                    "country_name": "Canada",
                    "state_code": "QC",
                    "subregion": "Quebec",
                    "zip_code": "H4T 1Z2",
                    "city": "Montreal",
                    "coords": "45.5016889, -73.56725599999999",
                    "hidden": false
                }
            ],
            "created_at": "2025-05-15T15:15:01Z"
        },
        {
            "id": "4a8a7f",
            "title": "Senior Software Developer- Javascript/Typescript- AWS- AI",
            "full_title": "Senior Software Developer- Javascript/Typescript- AWS- AI - ASE",
            "shortcode": "77B1A18CAC",
            "code": "ASE",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4883885",
            "application_url": "https://valsoft-corp.workable.com/jobs/4883885/candidates/new",
            "shortlink": "https://apply.workable.com/j/77B1A18CAC",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "JCC6506A507",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-05-22T11:14:31Z"
        },
        {
            "id": "4aa0ad",
            "title": "Intermediate Software Developer",
            "full_title": "Intermediate Software Developer - HR - 32718 Cred",
            "shortcode": "C2D4F5CC21",
            "code": "HR - 32718 Cred",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4889563",
            "application_url": "https://valsoft-corp.workable.com/jobs/4889563/candidates/new",
            "shortlink": "https://apply.workable.com/j/C2D4F5CC21",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "JDD5EFE6915",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-05-26T12:50:40Z"
        },
        {
            "id": "4aa4e0",
            "title": "FullStack Developer - Fast API / API / Python / NextJS",
            "full_title": "FullStack Developer - Fast API / API / Python / NextJS - HR - 23076 Sadi",
            "shortcode": "69783EFE1C",
            "code": "HR - 23076 Sadi",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Aspire Software Lebanon",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4890638",
            "application_url": "https://valsoft-corp.workable.com/jobs/4890638/candidates/new",
            "shortlink": "https://apply.workable.com/j/69783EFE1C",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "JE532ABD2F3",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-05-27T07:21:02Z"
        },
        {
            "id": "4aa7f4",
            "title": "AI Engineer",
            "full_title": "AI Engineer - Bengaluru",
            "shortcode": "8A2B35A53E",
            "code": null,
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465064,
                    "name": "Aspire Software India"
                },
                {
                    "id": 465073,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4891426",
            "application_url": "https://valsoft-corp.workable.com/jobs/4891426/candidates/new",
            "shortlink": "https://apply.workable.com/j/8A2B35A53E",
            "workplace_type": "hybrid",
            "location": {
                "location_str": "Bengaluru, Karnataka, India",
                "country": "India",
                "country_code": "IN",
                "region": "Karnataka",
                "region_code": "KA",
                "city": "Bengaluru",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "hybrid"
            },
            "locations": [
                {
                    "shortcode": "JAAAD86FB65",
                    "country_code": "IN",
                    "country_name": "India",
                    "state_code": "KA",
                    "subregion": "Karnataka",
                    "zip_code": null,
                    "city": "Bengaluru",
                    "coords": "12.9715987, 77.59456269999998",
                    "hidden": false
                }
            ],
            "created_at": "2025-05-27T13:24:32Z"
        },
        {
            "id": "4aaa4a",
            "title": "Analista de Support",
            "full_title": "Analista de Support - Brazil",
            "shortcode": "113249050C",
            "code": null,
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Customer Support",
            "department_hierarchy": [
                {
                    "id": 439254,
                    "name": "VHL Sistemas"
                },
                {
                    "id": 439255,
                    "name": "Customer Support"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4892024",
            "application_url": "https://valsoft-corp.workable.com/jobs/4892024/candidates/new",
            "shortlink": "https://apply.workable.com/j/113249050C",
            "workplace_type": "remote",
            "location": {
                "location_str": "Brazil",
                "country": "Brazil",
                "country_code": "BR",
                "region": null,
                "region_code": null,
                "city": null,
                "zip_code": null,
                "telecommuting": true,
                "workplace_type": "remote"
            },
            "locations": [
                {
                    "shortcode": "JC9E5B55FB6",
                    "country_code": "BR",
                    "country_name": "Brazil",
                    "state_code": "",
                    "subregion": null,
                    "zip_code": null,
                    "city": "",
                    "coords": "-14.235004, -51.92528",
                    "hidden": false
                }
            ],
            "salary": {
                "salary_currency": "brl"
            },
            "created_at": "2025-05-27T16:24:40Z"
        },
        {
            "id": "4ad227",
            "title": "Lead Generation - Business Development Representative - AI Suite",
            "full_title": "Lead Generation - Business Development Representative - AI Suite - HR-32972",
            "shortcode": "2C8F9402A4",
            "code": "HR-32972",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Sales",
            "department_hierarchy": [
                {
                    "id": 342001,
                    "name": "Aspire Software"
                },
                {
                    "id": 454064,
                    "name": "Sales"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4902229",
            "application_url": "https://valsoft-corp.workable.com/jobs/4902229/candidates/new",
            "shortlink": "https://apply.workable.com/j/2C8F9402A4",
            "workplace_type": "remote",
            "location": {
                "location_str": "United States",
                "country": "United States",
                "country_code": "US",
                "region": null,
                "region_code": null,
                "city": null,
                "zip_code": null,
                "telecommuting": true,
                "workplace_type": "remote"
            },
            "locations": [
                {
                    "shortcode": "J33672BD4E7",
                    "country_code": "US",
                    "country_name": "United States",
                    "state_code": "",
                    "subregion": null,
                    "zip_code": null,
                    "city": "",
                    "coords": "37.09024, -95.71289100000001",
                    "hidden": false
                }
            ],
            "salary": {
                "salary_currency": "usd"
            },
            "created_at": "2025-05-30T19:41:26Z"
        },
        {
            "id": "4adb1f",
            "title": "Senior SQL Server DBA",
            "full_title": "Senior SQL Server DBA - HR - 32993 MPS",
            "shortcode": "14F9F828AD",
            "code": "HR - 32993 MPS",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Professional Services",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465082,
                    "name": "Professional Services"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4904525",
            "application_url": "https://valsoft-corp.workable.com/jobs/4904525/candidates/new",
            "shortlink": "https://apply.workable.com/j/14F9F828AD",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "J066F61F40F",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-06-02T05:38:41Z"
        },
        {
            "id": "4add46",
            "title": "Senior .NET Developer",
            "full_title": "Senior .NET Developer - HR -32991 MPS",
            "shortcode": "A3DC3E158C",
            "code": "HR -32991 MPS",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4905076",
            "application_url": "https://valsoft-corp.workable.com/jobs/4905076/candidates/new",
            "shortlink": "https://apply.workable.com/j/A3DC3E158C",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "J5CE4ED7703",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-06-02T06:51:45Z"
        },
        {
            "id": "4afea2",
            "title": "Directeur des Opérations | Operations Manager",
            "full_title": "Directeur des Opérations | Operations Manager - Montreal",
            "shortcode": "FCDA0C5DEF",
            "code": null,
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Gestion des opérations | Operations Management",
            "department_hierarchy": [
                {
                    "id": 439244,
                    "name": "ValPay"
                },
                {
                    "id": 470207,
                    "name": "Gestion des opérations | Operations Management"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4913616",
            "application_url": "https://valsoft-corp.workable.com/jobs/4913616/candidates/new",
            "shortlink": "https://apply.workable.com/j/FCDA0C5DEF",
            "workplace_type": "hybrid",
            "location": {
                "location_str": "Montreal, Quebec, Canada",
                "country": "Canada",
                "country_code": "CA",
                "region": "Quebec",
                "region_code": "QC",
                "city": "Montreal",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "hybrid"
            },
            "locations": [
                {
                    "shortcode": "J17AD707D31",
                    "country_code": "CA",
                    "country_name": "Canada",
                    "state_code": "QC",
                    "subregion": "Quebec",
                    "zip_code": null,
                    "city": "Montreal",
                    "coords": "45.5016889, -73.56725599999999",
                    "hidden": false
                }
            ],
            "salary": {
                "salary_currency": "cad"
            },
            "created_at": "2025-06-04T09:39:07Z"
        },
        {
            "id": "4b04c3",
            "title": "Analista de Qualidade do Produto",
            "full_title": "Analista de Qualidade do Produto - Brazil",
            "shortcode": "FD833127A5",
            "code": null,
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 439254,
                    "name": "VHL Sistemas"
                },
                {
                    "id": 439262,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4915185",
            "application_url": "https://valsoft-corp.workable.com/jobs/4915185/candidates/new",
            "shortlink": "https://apply.workable.com/j/FD833127A5",
            "workplace_type": "remote",
            "location": {
                "location_str": "Brazil",
                "country": "Brazil",
                "country_code": "BR",
                "region": null,
                "region_code": null,
                "city": null,
                "zip_code": null,
                "telecommuting": true,
                "workplace_type": "remote"
            },
            "locations": [
                {
                    "shortcode": "J421A7477A8",
                    "country_code": "BR",
                    "country_name": "Brazil",
                    "state_code": "",
                    "subregion": null,
                    "zip_code": null,
                    "city": "",
                    "coords": "-14.235004, -51.92528",
                    "hidden": false
                }
            ],
            "salary": {
                "salary_currency": "brl"
            },
            "created_at": "2025-06-04T19:26:18Z"
        },
        {
            "id": "4b1149",
            "title": "Operations Manager - ValPay",
            "full_title": "Operations Manager - ValPay - United States",
            "shortcode": "CCBB1EC950",
            "code": null,
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Gestion des opérations | Operations Management",
            "department_hierarchy": [
                {
                    "id": 439244,
                    "name": "ValPay"
                },
                {
                    "id": 470207,
                    "name": "Gestion des opérations | Operations Management"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4918391",
            "application_url": "https://valsoft-corp.workable.com/jobs/4918391/candidates/new",
            "shortlink": "https://apply.workable.com/j/CCBB1EC950",
            "workplace_type": "remote",
            "location": {
                "location_str": "United States",
                "country": "United States",
                "country_code": "US",
                "region": null,
                "region_code": null,
                "city": null,
                "zip_code": null,
                "telecommuting": true,
                "workplace_type": "remote"
            },
            "locations": [
                {
                    "shortcode": "JE198422013",
                    "country_code": "US",
                    "country_name": "United States",
                    "state_code": "",
                    "subregion": null,
                    "zip_code": null,
                    "city": "",
                    "coords": "37.09024, -95.71289100000001",
                    "hidden": false
                }
            ],
            "salary": {
                "salary_currency": "usd"
            },
            "created_at": "2025-06-05T15:59:44Z"
        },
        {
            "id": "4b28dc",
            "title": "Document Specialist (SQL, C#)",
            "full_title": "Document Specialist (SQL, C#) - HR-33312",
            "shortcode": "65CD511883",
            "code": "HR-33312",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Professional Services",
            "department_hierarchy": [
                {
                    "id": 439324,
                    "name": "WeSuite"
                },
                {
                    "id": 439331,
                    "name": "Professional Services"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4924426",
            "application_url": "https://valsoft-corp.workable.com/jobs/4924426/candidates/new",
            "shortlink": "https://apply.workable.com/j/65CD511883",
            "workplace_type": "hybrid",
            "location": {
                "location_str": "White Plains, New York, United States",
                "country": "United States",
                "country_code": "US",
                "region": "New York",
                "region_code": "NY",
                "city": "White Plains",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "hybrid"
            },
            "locations": [
                {
                    "shortcode": "JE27B144B14",
                    "country_code": "US",
                    "country_name": "United States",
                    "state_code": "NY",
                    "subregion": "New York",
                    "zip_code": null,
                    "city": "White Plains",
                    "coords": "41.03398620000001, -73.76290970000002",
                    "hidden": false
                }
            ],
            "created_at": "2025-06-09T15:22:53Z"
        },
        {
            "id": "4b292c",
            "title": "Customer Success Manager",
            "full_title": "Customer Success Manager - HR-33292",
            "shortcode": "07997DC97C",
            "code": "HR-33292",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Sales",
            "department_hierarchy": [
                {
                    "id": 438687,
                    "name": "DemandBridge"
                },
                {
                    "id": 438696,
                    "name": "Sales"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4924506",
            "application_url": "https://valsoft-corp.workable.com/jobs/4924506/candidates/new",
            "shortlink": "https://apply.workable.com/j/07997DC97C",
            "workplace_type": "remote",
            "location": {
                "location_str": "United States",
                "country": "United States",
                "country_code": "US",
                "region": null,
                "region_code": null,
                "city": null,
                "zip_code": null,
                "telecommuting": true,
                "workplace_type": "remote"
            },
            "locations": [
                {
                    "shortcode": "J8EFBAC4A03",
                    "country_code": "US",
                    "country_name": "United States",
                    "state_code": "",
                    "subregion": null,
                    "zip_code": null,
                    "city": "",
                    "coords": "37.09024, -95.71289100000001",
                    "hidden": false
                }
            ],
            "created_at": "2025-06-09T15:57:12Z"
        },
        {
            "id": "4b2e8f",
            "title": "Senior Quality Assurance Engineer ( Automation and Manual Testing)",
            "full_title": "Senior Quality Assurance Engineer ( Automation and Manual Testing) - HR-25426 Dock",
            "shortcode": "C5846D1021",
            "code": "HR-25426 Dock",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4925885",
            "application_url": "https://valsoft-corp.workable.com/jobs/4925885/candidates/new",
            "shortlink": "https://apply.workable.com/j/C5846D1021",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "JA564C51ED0",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-06-10T08:39:55Z"
        },
        {
            "id": "4b2ea7",
            "title": "Lead FullStack Developer - Azure/C#/React",
            "full_title": "Lead FullStack Developer - Azure/C#/React - HR -33357 Lead Exp",
            "shortcode": "061AFE8604",
            "code": "HR -33357 Lead Exp",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4925909",
            "application_url": "https://valsoft-corp.workable.com/jobs/4925909/candidates/new",
            "shortlink": "https://apply.workable.com/j/061AFE8604",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "J28CA7B4FEC",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-06-10T08:53:01Z"
        },
        {
            "id": "4b2ebf",
            "title": "Senior Front End Developer",
            "full_title": "Senior Front End Developer - HR -33357 Form Exp",
            "shortcode": "4020ED9627",
            "code": "HR -33357 Form Exp",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4925933",
            "application_url": "https://valsoft-corp.workable.com/jobs/4925933/candidates/new",
            "shortlink": "https://apply.workable.com/j/4020ED9627",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "J048938D84F",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-06-10T09:01:14Z"
        },
        {
            "id": "4b406d",
            "title": "Tax Manager",
            "full_title": "Tax Manager - Canada",
            "shortcode": "32974D0C28",
            "code": null,
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": null,
            "department_hierarchy": [],
            "url": "https://valsoft-corp.workable.com/jobs/4930459",
            "application_url": "https://valsoft-corp.workable.com/jobs/4930459/candidates/new",
            "shortlink": "https://apply.workable.com/j/32974D0C28",
            "workplace_type": "remote",
            "location": {
                "location_str": "Canada",
                "country": "Canada",
                "country_code": "CA",
                "region": null,
                "region_code": null,
                "city": null,
                "zip_code": null,
                "telecommuting": true,
                "workplace_type": "remote"
            },
            "locations": [
                {
                    "shortcode": "JF48E98A1BC",
                    "country_code": "CA",
                    "country_name": "Canada",
                    "state_code": "",
                    "subregion": null,
                    "zip_code": null,
                    "city": "",
                    "coords": "56.130366, -106.346771",
                    "hidden": false
                }
            ],
            "created_at": "2025-06-11T19:05:18Z"
        },
        {
            "id": "4b40f3",
            "title": "Practice Development Associate",
            "full_title": "Practice Development Associate - HR-33431",
            "shortcode": "0A9A96870C",
            "code": "HR-33431",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Marketing",
            "department_hierarchy": [
                {
                    "id": 439194,
                    "name": "TDO Software"
                },
                {
                    "id": 439200,
                    "name": "Marketing"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4930593",
            "application_url": "https://valsoft-corp.workable.com/jobs/4930593/candidates/new",
            "shortlink": "https://apply.workable.com/j/0A9A96870C",
            "workplace_type": "remote",
            "location": {
                "location_str": "United States",
                "country": "United States",
                "country_code": "US",
                "region": null,
                "region_code": null,
                "city": null,
                "zip_code": null,
                "telecommuting": true,
                "workplace_type": "remote"
            },
            "locations": [
                {
                    "shortcode": "J03CFA86686",
                    "country_code": "US",
                    "country_name": "United States",
                    "state_code": "",
                    "subregion": null,
                    "zip_code": null,
                    "city": "",
                    "coords": "37.09024, -95.71289100000001",
                    "hidden": false
                }
            ],
            "created_at": "2025-06-11T19:51:39Z"
        },
        {
            "id": "4b489b",
            "title": "Sales Account Executive",
            "full_title": "Sales Account Executive - HR-33493",
            "shortcode": "87B71651A3",
            "code": "HR-33493",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Sales",
            "department_hierarchy": [
                {
                    "id": 438657,
                    "name": "Cott Systems"
                },
                {
                    "id": 438666,
                    "name": "Sales"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4932553",
            "application_url": "https://valsoft-corp.workable.com/jobs/4932553/candidates/new",
            "shortlink": "https://apply.workable.com/j/87B71651A3",
            "workplace_type": "remote",
            "location": {
                "location_str": "United States",
                "country": "United States",
                "country_code": "US",
                "region": null,
                "region_code": null,
                "city": null,
                "zip_code": null,
                "telecommuting": true,
                "workplace_type": "remote"
            },
            "locations": [
                {
                    "shortcode": "J3EEE401504",
                    "country_code": "US",
                    "country_name": "United States",
                    "state_code": "",
                    "subregion": null,
                    "zip_code": null,
                    "city": "",
                    "coords": "37.09024, -95.71289100000001",
                    "hidden": false
                }
            ],
            "created_at": "2025-06-12T16:12:57Z"
        },
        {
            "id": "4b5e0c",
            "title": "Tax Manager",
            "full_title": "Tax Manager - Montreal",
            "shortcode": "56AE23AC13",
            "code": null,
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Finances | Finance",
            "department_hierarchy": [
                {
                    "id": 342000,
                    "name": "Valsoft"
                },
                {
                    "id": 342723,
                    "name": "Finances | Finance"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4938042",
            "application_url": "https://valsoft-corp.workable.com/jobs/4938042/candidates/new",
            "shortlink": "https://apply.workable.com/j/56AE23AC13",
            "workplace_type": "hybrid",
            "location": {
                "location_str": "Montreal, Quebec, Canada",
                "country": "Canada",
                "country_code": "CA",
                "region": "Quebec",
                "region_code": "QC",
                "city": "Montreal",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "hybrid"
            },
            "locations": [
                {
                    "shortcode": "J88E256AE31",
                    "country_code": "CA",
                    "country_name": "Canada",
                    "state_code": "QC",
                    "subregion": "Quebec",
                    "zip_code": null,
                    "city": "Montreal",
                    "coords": "45.5016889, -73.56725599999999",
                    "hidden": false
                }
            ],
            "created_at": "2025-06-13T18:27:05Z"
        },
        {
            "id": "4b7176",
            "title": "Senior Fullstack Software Engineer",
            "full_title": "Senior Fullstack Software Engineer - HR-33494 Schol",
            "shortcode": "D6DC21203F",
            "code": "HR-33494 Schol",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4943012",
            "application_url": "https://valsoft-corp.workable.com/jobs/4943012/candidates/new",
            "shortlink": "https://apply.workable.com/j/D6DC21203F",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "JA3BA616685",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-06-17T06:40:01Z"
        },
        {
            "id": "4b718b",
            "title": "Senior .NET/C# developer",
            "full_title": "Senior .NET/C# developer - HR -33495 Work Dyn.",
            "shortcode": "6B577C379A",
            "code": "HR -33495 Work Dyn.",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4943033",
            "application_url": "https://valsoft-corp.workable.com/jobs/4943033/candidates/new",
            "shortlink": "https://apply.workable.com/j/6B577C379A",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "JA4927F4A58",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-06-17T06:49:30Z"
        },
        {
            "id": "4b719c",
            "title": "Senior FullStack Developer",
            "full_title": "Senior FullStack Developer - HR-33414 Cred",
            "shortcode": "D534E20E2C",
            "code": "HR-33414 Cred",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4943050",
            "application_url": "https://valsoft-corp.workable.com/jobs/4943050/candidates/new",
            "shortlink": "https://apply.workable.com/j/D534E20E2C",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "JAA9BC91B41",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-06-17T06:59:19Z"
        },
        {
            "id": "4b776f",
            "title": "Assistant Financial Controller/Financial Analyst",
            "full_title": "Assistant Financial Controller/Financial Analyst - HR-33626",
            "shortcode": "4CE2BA9E5A",
            "code": "HR-33626",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Finance",
            "department_hierarchy": [
                {
                    "id": 438993,
                    "name": "M&I Broadcast Services"
                },
                {
                    "id": 438995,
                    "name": "Finance"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4944541",
            "application_url": "https://valsoft-corp.workable.com/jobs/4944541/candidates/new",
            "shortlink": "https://apply.workable.com/j/4CE2BA9E5A",
            "workplace_type": "hybrid",
            "location": {
                "location_str": "Hilversum, North Holland, Netherlands",
                "country": "Netherlands",
                "country_code": "NL",
                "region": "North Holland",
                "region_code": "NH",
                "city": "Hilversum",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "hybrid"
            },
            "locations": [
                {
                    "shortcode": "JFABC818841",
                    "country_code": "NL",
                    "country_name": "Netherlands",
                    "state_code": "NH",
                    "subregion": "North Holland",
                    "zip_code": null,
                    "city": "Hilversum",
                    "coords": "52.2291696, 5.166897400000039",
                    "hidden": false
                }
            ],
            "created_at": "2025-06-17T16:09:01Z"
        },
        {
            "id": "4b7b77",
            "title": "Sales and Development Lead",
            "full_title": "Sales and Development Lead - United States",
            "shortcode": "865061737F",
            "code": null,
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Sales",
            "department_hierarchy": [
                {
                    "id": 438637,
                    "name": "Chordline Health"
                },
                {
                    "id": 438646,
                    "name": "Sales"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4945573",
            "application_url": "https://valsoft-corp.workable.com/jobs/4945573/candidates/new",
            "shortlink": "https://apply.workable.com/j/865061737F",
            "workplace_type": "remote",
            "location": {
                "location_str": "United States",
                "country": "United States",
                "country_code": "US",
                "region": null,
                "region_code": null,
                "city": null,
                "zip_code": null,
                "telecommuting": true,
                "workplace_type": "remote"
            },
            "locations": [
                {
                    "shortcode": "J6371D2D79B",
                    "country_code": "US",
                    "country_name": "United States",
                    "state_code": "",
                    "subregion": null,
                    "zip_code": null,
                    "city": "",
                    "coords": "37.09024, -95.71289100000001",
                    "hidden": false
                }
            ],
            "created_at": "2025-06-18T01:15:50Z"
        },
        {
            "id": "4b7eb0",
            "title": "Tax Manager",
            "full_title": "Tax Manager - HR-33631",
            "shortcode": "AB895F6252",
            "code": "HR-33631",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Finance",
            "department_hierarchy": [
                {
                    "id": 342001,
                    "name": "Aspire Software"
                },
                {
                    "id": 454067,
                    "name": "Finance"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4946398",
            "application_url": "https://valsoft-corp.workable.com/jobs/4946398/candidates/new",
            "shortlink": "https://apply.workable.com/j/AB895F6252",
            "workplace_type": "remote",
            "location": {
                "location_str": "United Kingdom",
                "country": "United Kingdom",
                "country_code": "GB",
                "region": null,
                "region_code": null,
                "city": null,
                "zip_code": null,
                "telecommuting": true,
                "workplace_type": "remote"
            },
            "locations": [
                {
                    "shortcode": "J43F97DEBC0",
                    "country_code": "GB",
                    "country_name": "United Kingdom",
                    "state_code": "",
                    "subregion": null,
                    "zip_code": null,
                    "city": "",
                    "coords": "55.378051, -3.43597299999999",
                    "hidden": false
                }
            ],
            "salary": {
                "salary_currency": "gbp"
            },
            "created_at": "2025-06-18T10:55:16Z"
        },
        {
            "id": "4b8183",
            "title": "Tax Manager",
            "full_title": "Tax Manager - HR-33631",
            "shortcode": "731E90060B",
            "code": "HR-33631",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Finance",
            "department_hierarchy": [
                {
                    "id": 342001,
                    "name": "Aspire Software"
                },
                {
                    "id": 454067,
                    "name": "Finance"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4947121",
            "application_url": "https://valsoft-corp.workable.com/jobs/4947121/candidates/new",
            "shortlink": "https://apply.workable.com/j/731E90060B",
            "workplace_type": "remote",
            "location": {
                "location_str": "Ireland",
                "country": "Ireland",
                "country_code": "IE",
                "region": null,
                "region_code": null,
                "city": null,
                "zip_code": null,
                "telecommuting": true,
                "workplace_type": "remote"
            },
            "locations": [
                {
                    "shortcode": "JE03CE30EA4",
                    "country_code": "IE",
                    "country_name": "Ireland",
                    "state_code": "",
                    "subregion": null,
                    "zip_code": null,
                    "city": "",
                    "coords": "53.41291, -8.24389",
                    "hidden": false
                }
            ],
            "salary": {
                "salary_currency": "eur"
            },
            "created_at": "2025-06-18T14:00:24Z"
        },
        {
            "id": "4b9e6d",
            "title": "Senior AI Developer",
            "full_title": "Senior AI Developer - HR -33689 Ant Piazza",
            "shortcode": "13410B34DC",
            "code": "HR -33689 Ant Piazza",
            "state": "published",
            "sample": false,
            "confidential": false,
            "department": "Research & Development",
            "department_hierarchy": [
                {
                    "id": 465065,
                    "name": "Aspire Software Lebanon"
                },
                {
                    "id": 465083,
                    "name": "Research & Development"
                }
            ],
            "url": "https://valsoft-corp.workable.com/jobs/4954523",
            "application_url": "https://valsoft-corp.workable.com/jobs/4954523/candidates/new",
            "shortlink": "https://apply.workable.com/j/13410B34DC",
            "workplace_type": "on_site",
            "location": {
                "location_str": "Beirut, Beirut Governorate, Lebanon",
                "country": "Lebanon",
                "country_code": "LB",
                "region": "Beirut Governorate",
                "region_code": "Beirut Governorate",
                "city": "Beirut",
                "zip_code": null,
                "telecommuting": false,
                "workplace_type": "on_site"
            },
            "locations": [
                {
                    "shortcode": "J45CC2ADEBD",
                    "country_code": "LB",
                    "country_name": "Lebanon",
                    "state_code": "Beirut Governorate",
                    "subregion": "Beirut Governorate",
                    "zip_code": null,
                    "city": "Beirut",
                    "coords": "33.8937913, 35.5017767",
                    "hidden": false
                }
            ],
            "created_at": "2025-06-23T05:44:44Z"
        }
    ],
    "paging": {
        "next": "https://valsoft-corp.workable.com/spi/v3/jobs?limit=50&since_id=4ba764&state=published"
    }
}