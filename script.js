document.addEventListener('DOMContentLoaded', () => {
    const dailyBtn = document.querySelector('.daily-para');
    const weeklyBtn = document.querySelector('.weekly-para');
    const monthlyBtn = document.querySelector('.monthly-para');
  
    const currentElements = document.querySelectorAll('.para-current');
    const previousElements = document.querySelectorAll('.span-previous');
    const titleElements = document.querySelectorAll('.card-title');
  
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');
    const reportFor = document.getElementById('report-for');
  
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
  
        // Başlangıçta haftalık verileri çek
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
  
      // Sıralı kurs ID'leri
      const sortedCourseIds = Array.from(courseNamesMap.keys()).sort((a, b) => a - b);
  
      titleElements.forEach((titleElement, index) => {
        const courseId = sortedCourseIds[index]; // Sıralı ID
        const currentElement = currentElements[index];
        const previousElement = previousElements[index];
  
        const item = coursesMap.get(courseId);
        const previousItem = previousCoursesMap.get(courseId);
  
        // Kurs ismini al, veri yoksa varsayılan değerle göster
        const courseName = courseNamesMap.get(courseId) || `Course ID ${courseId}`;
  
        if (item) {
          titleElement.textContent = courseName;
          currentElement.textContent = `${item.totalMinutesWorked / 60}hrs`;
        } else {
          titleElement.textContent = courseName;
          currentElement.textContent = '0hrs';
        }
  
        if (previousItem) {
          previousElement.textContent = `${previousPeriodLabel} - ${previousItem.totalMinutesWorked / 60}hrs`;
        } else {
          previousElement.textContent = `${previousPeriodLabel} - 0hrs`;
        }
      });
    }
  
    // Fetch time entry data
    async function fetchData(currentUrl, previousUrl, previousPeriodLabel) {
      try {
        const currentResponse = await fetch(currentUrl, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        const previousResponse = await fetch(previousUrl, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
  
        if (!currentResponse.ok) throw new Error('Failed to fetch current time entries');
        if (!previousResponse.ok) throw new Error('Failed to fetch previous time entries');
  
        const currentData = await currentResponse.json();
        const previousData = await previousResponse.json();
        updateView(currentData, previousData, previousPeriodLabel);
      } catch (error) {
        console.error('Error fetching time entries:', error);
      }
    }
  
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
      window.location.href = 'login.html'; // Login sayfasına yönlendir
    });

     // Add event listeners for "Save Course" buttons
  document.querySelectorAll('.save-course-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      const card = event.target.closest('.course-card');
      const inputContainer = card.querySelector('.input-container');
      inputContainer.style.display = 'block';
    });
  });

  // Handle course name submission
  document.querySelectorAll('.submit-course-btn').forEach(button => {
    button.addEventListener('click', async (event) => {
      const card = event.target.closest('.course-card');
      const courseNameInput = card.querySelector('.course-name-input');
      const courseId = /* get course ID based on the card or context */;

      if (courseNameInput.value.trim()) {
        try {
          await saveCourse(courseId, courseNameInput.value.trim());
          fetchCourses(); // Refresh the course list to reflect the update
          card.querySelector('.input-container').style.display = 'none'; // Hide input field
        } catch (error) {
          console.error('Error saving course:', error);
        }
      } else {
        alert('Course name cannot be empty.');
      }
    });
  });

  // Function to save course
  async function saveCourse(courseId, courseName) {
    const url = `${baseURL}/course/save`; // Adjust the endpoint as necessary
    const data = { courseId, courseName };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Failed to save course');
    return response.json();
  }

    // Başlangıç verilerini getir
    fetchCourses();
  });