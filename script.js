document.addEventListener('DOMContentLoaded', () => {
    // Selectors for buttons and elements
    const dailyBtn = document.querySelector('.daily-para');
    const weeklyBtn = document.querySelector('.weekly-para');
    const monthlyBtn = document.querySelector('.monthly-para');

    const currentElements = document.querySelectorAll('.para-current');
    const previousElements = document.querySelectorAll('.span-previous');
    const titleElements = document.querySelectorAll('.card-title');

    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');
    const reportFor = document.getElementById('report-for');

    const ellipsisButtons = document.querySelectorAll('.icon-ellipsis');

    const baseURL = 'http://localhost:8080';
    const courseEndpoint = `${baseURL}/course/getAllUsersCourses`;
    const timeEntryEndpoint = `${baseURL}/timeEntry`;

    // Map to store course names by ID
    const courseNamesMap = new Map();

    // Fetch all courses
    async function fetchCourses() {
        try {
            const response = await fetch(courseEndpoint, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch courses');

            const data = await response.json();
            data.object.forEach(course => {
                courseNamesMap.set(course.id, course.courseName);
            });

            // Fetch weekly data initially
            fetchData(
                `${timeEntryEndpoint}/getAllWeeklyTimeEntriesByUser`,
                `${timeEntryEndpoint}/getAllPreviousWeekTimeEntriesByUser`,
                'Last Week'
            );
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    }

    // Update view with time entry data
    function updateView(data, previousData, previousPeriodLabel) {
        console.log('Data received:', data);

        // Clear all elements initially
        currentElements.forEach(el => el.textContent = '0hrs');
        previousElements.forEach(el => el.textContent = `${previousPeriodLabel} - 0hrs`);
        titleElements.forEach(el => el.textContent = '');

        // Create maps for current and previous data
        const coursesMap = new Map();
        if (Array.isArray(data.object)) {
            data.object.forEach(item => {
                coursesMap.set(item.courseId, item);
            });
        } else {
            console.error('Expected an array but received:', data);
        }

        const previousCoursesMap = new Map();
        if (Array.isArray(previousData.object)) {
            previousData.object.forEach(item => {
                previousCoursesMap.set(item.courseId, item);
            });
        } else {
            console.error('Expected an array for previous data but received:', previousData);
        }

        // Sorted course IDs
        const sortedCourseIds = Array.from(courseNamesMap.keys()).sort((a, b) => a - b);

        const formatHours = (minutes) => {
            const hours = minutes / 60;
            return hours.toFixed(1) + (hours === 1 ? 'hr' : 'hrs');
        };

        titleElements.forEach((titleElement, index) => {
            const courseId = sortedCourseIds[index]; // Sorted ID
            const currentElement = currentElements[index];
            const previousElement = previousElements[index];

            const item = coursesMap.get(courseId);
            const previousItem = previousCoursesMap.get(courseId);

            // Get course name or use default
            const courseName = courseNamesMap.get(courseId) || `Course ID ${courseId}`;

            titleElement.textContent = courseName;
            currentElement.textContent = item ? formatHours(item.totalMinutesWorked) : '0.0hr';
            previousElement.textContent = previousItem ? `${previousPeriodLabel} - ${formatHours(previousItem.totalMinutesWorked)}` : `${previousPeriodLabel} - 0.0hr`;
        });
    }

    // Fetch time entry data
    async function fetchData(currentUrl, previousUrl, previousPeriodLabel) {
        try {
            const [currentResponse, previousResponse] = await Promise.all([
                fetch(currentUrl, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                }),
                fetch(previousUrl, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                })
            ]);

            if (!currentResponse.ok) throw new Error('Failed to fetch current time entries');
            if (!previousResponse.ok) throw new Error('Failed to fetch previous time entries');

            const currentData = await currentResponse.json();
            const previousData = await previousResponse.json();
            updateView(currentData, previousData, previousPeriodLabel);
        } catch (error) {
            console.error('Error fetching time entries:', error);
        }
    }

    // Button click event listeners for time range
    dailyBtn.addEventListener('click', () => {
        dailyBtn.classList.add('active');
        weeklyBtn.classList.remove('active');
        monthlyBtn.classList.remove('active');
        fetchData(
            `${timeEntryEndpoint}/getAllDailyTimeEntriesByUser`,
            `${timeEntryEndpoint}/getAllPreviousDayTimeEntriesByUser`,
            'Previous Day'
        );
    });

    weeklyBtn.addEventListener('click', () => {
        weeklyBtn.classList.add('active');
        dailyBtn.classList.remove('active');
        monthlyBtn.classList.remove('active');
        fetchData(
            `${timeEntryEndpoint}/getAllWeeklyTimeEntriesByUser`,
            `${timeEntryEndpoint}/getAllPreviousWeekTimeEntriesByUser`,
            'Previous Week'
        );
    });

    monthlyBtn.addEventListener('click', () => {
        monthlyBtn.classList.add('active');
        dailyBtn.classList.remove('active');
        weeklyBtn.classList.remove('active');
        fetchData(
            `${timeEntryEndpoint}/getAllMonthlyTimeEntriesByUser`,
            `${timeEntryEndpoint}/getAllPreviousMonthTimeEntriesByUser`,
            'Previous Month'
        );
    });

    // Handle welcome message and logout
    const username = localStorage.getItem('username');
    if (username) {
        welcomeMessage.textContent = `Welcome, ${username}!`;
        reportFor.textContent = `Report For, ${username}`;
    } else {
        welcomeMessage.textContent = 'Welcome, Guest!';
        reportFor.textContent = `Report For, Guest!`;
    }

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        window.location.href = 'login.html'; // Redirect to login page
    });

    // Add click event listener to each ellipsis button
    ellipsisButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Prevent the click event from propagating to document level
            event.stopPropagation();

            // Get the target dropdown menu
            const targetSelector = button.getAttribute('data-target');
            console.log('Target Selector:', targetSelector);  // Debugging line
            const dropdown = document.querySelector(targetSelector);

            if (targetSelector && dropdown) {
                // Close all dropdowns first
                document.querySelectorAll('.theme-card-info').forEach(dropdownElement => {
                    if (dropdownElement !== dropdown) {
                        dropdownElement.classList.add('hidden');
                        dropdownElement.classList.add("border-radius");
                        dropdownElement.classList.remove("border-top-radius");
                    } 
                });

                // Toggle the current dropdown
                dropdown.classList.toggle('hidden');
                dropdown.classList.toggle("border-radius");
                dropdown.classList.toggle("border-top-radius");
            } else {
                if (!targetSelector) {
                    console.error('data-target attribute is missing or empty.');
                } else {
                    console.error(`Dropdown with selector "${targetSelector}" not found.`);
                }
            }
        });
    });

    // Close dropdown when clicking outside of it
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.theme-card')) {
            document.querySelectorAll('.theme-card-info').forEach(dropdown => {
                dropdown.classList.add('hidden');
                dropdown.classList.add("border-radius");
                dropdown.classList.remove("border-top-radius");
            });
        }
    });

     // "Add Time Entry" seçeneğine tıklama olayı
     document.querySelectorAll('.theme-card-list li').forEach((item) => {
        if (item.textContent.includes('Add Time Entry')) {
            item.addEventListener('click', () => {
                const timeEntryForm = document.getElementById('time-entry-form');
                timeEntryForm.classList.remove('hidden'); // Formu görünür yap
            });
        }
    });

    // Formun kapanması için tıklama dışı olay
    document.addEventListener('click', (event) => {
        const timeEntryForm = document.getElementById('time-entry-form');
        if (!event.target.closest('#time-entry-form') && !event.target.closest('.theme-card')) {
            timeEntryForm.classList.add('hidden'); // Formu tekrar gizle
        }
    });

    // Add Time Entry butonları için event listener ekleyelim
document.querySelectorAll('.add-time-entry-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        // En yakın theme-card öğesini bul ve courseId'yi al
        const themeCard = event.target.closest('.theme-card');
        const courseId = themeCard.getAttribute('data-course-id');
        
        // Formu göster ve courseId'yi otomatik doldur
        const timeEntryForm = document.getElementById('time-entry-form');
        timeEntryForm.classList.remove('hidden');

        const courseIdInput = document.getElementById('courseId');
        courseIdInput.value = courseId; // Kurs ID'sini input'a otomatik olarak yerleştir
        
        // Sayfayı kaydırarak forma götür
        timeEntryForm.scrollIntoView({ behavior: 'smooth' });
    });
});

    // Fetch initial data
    fetchCourses();
});