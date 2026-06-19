import http from 'http';

http.get('http://localhost:5000/api/course/all', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    try {
        const json = JSON.parse(data);
        console.log('Success:', json.success);
        console.log('Courses count:', json.courses ? json.courses.length : 'undefined');
        if (json.courses && json.courses.length === 0) {
            console.log('Courses array is empty!');
        } else if (json.courses) {
            console.log('First course title:', json.courses[0].courseTitle);
            console.log('First course educator:', json.courses[0].educator);
        } else {
            console.log('Message:', json.message);
        }
    } catch(e) {
        console.log('Raw Data:', data);
    }
  });
}).on('error', err => {
  console.log('Error:', err.message);
});
