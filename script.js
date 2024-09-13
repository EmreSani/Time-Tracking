document.addEventListener('DOMContentLoaded', () => {
  const dailyBtn = document.querySelector('.daily-para');
  const weeklyBtn = document.querySelector('.weekly-para');
  const monthlyBtn = document.querySelector('.monthly-para');

  const currentElements = document.querySelectorAll('.para-current');
  const previousElements = document.querySelectorAll('.span-previous');
  const titleElements = document.querySelectorAll('.card-title');

  const welcomeMessage = document.getElementById('welcome-message');
  const logoutBtn = document.getElementById('logout-btn');

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
          fetchData(`${timeEntryEndpoint}/getAllWeeklyTimeEntriesByUser`, `${timeEntryEndpoint}/getAllPreviousWeekTimeEntriesByUser`, 'Last Week');
      } catch (error) {
          console.error('Error fetching courses:', error);
      }
  }

  // Update view with time entry data
  function updateView(data, previousData, previousPeriodLabel) {
      console.log('Data received:', data);

      currentElements.forEach(el => el.textContent = '0hrs');
      previousElements.forEach(el => el.textContent = `${previousPeriodLabel} - 0hrs`);
      titleElements.forEach(el => el.textContent = '');

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

      titleElements.forEach((titleElement, index) => {
          const courseId = index + 1; // Assuming course IDs are 1-based and match the index
          const currentElement = currentElements[index];
          const previousElement = previousElements[index];

          const item = coursesMap.get(courseId);
          const previousItem = previousCoursesMap.get(courseId);

          if (item) {
              titleElement.textContent = courseNamesMap.get(courseId) || `Course ID ${courseId}`;
              currentElement.textContent = `${item.totalMinutesWorked / 60}hrs`;

              const previousHours = previousItem ? `${previousItem.totalMinutesWorked / 60}hrs` : '0hrs';
              previousElement.textContent = `${previousPeriodLabel} - ${previousHours}`;
          } else {
              titleElement.textContent = courseNamesMap.get(courseId) || `Course ID ${courseId}`;
              currentElement.textContent = '0hrs';
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
      fetchData(`${timeEntryEndpoint}/getAllDailyTimeEntriesByUser`, `${timeEntryEndpoint}/getAllPreviousDayTimeEntriesByUser`, 'Previous Day');
  });

  weeklyBtn.addEventListener('click', () => {
      weeklyBtn.classList.add('active');
      dailyBtn.classList.remove('active');
      monthlyBtn.classList.remove('active');
      fetchData(`${timeEntryEndpoint}/getAllWeeklyTimeEntriesByUser`, `${timeEntryEndpoint}/getAllPreviousWeekTimeEntriesByUser`, 'Previous Week');
  });

  monthlyBtn.addEventListener('click', () => {
      monthlyBtn.classList.add('active');
      dailyBtn.classList.remove('active');
      weeklyBtn.classList.remove('active');
      fetchData(`${timeEntryEndpoint}/getAllMonthlyTimeEntriesByUser`, `${timeEntryEndpoint}/getAllPreviousMonthTimeEntriesByUser`, 'Previous Month');
  });

  // Handle welcome message and logout
  const username = localStorage.getItem('username');
  if (username) {
      welcomeMessage.textContent = `Welcome, ${username}!`;
  } else {
      welcomeMessage.textContent = 'Welcome, Guest!';
  }

  logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('username');
      window.location.href = 'login.html'; // Login sayfasına yönlendir
  });

  // Başlangıç verilerini getir
  fetchCourses();
});
