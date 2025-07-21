const namespace = 'madanraj-portfolio'; // Custom project key
const key = 'views';                    // Page-level identifier
const url = `https://api.countapi.xyz/hit/${namespace}/${key}`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    document.getElementById('visitCount').innerText = data.value + " views";
  })
  .catch(error => {
    console.error('CountAPI error:', error);
    document.getElementById('visitCount').innerText = "N/A";
  });

