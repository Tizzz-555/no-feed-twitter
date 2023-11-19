document.addEventListener('DOMContentLoaded', () => {
  let allMedia = [];
  const tweetButton = document.getElementById('tweetButton');
  const tweetText = document.getElementById('tweetText');
  const mediaInput = document.getElementById('mediaInput');
  const mediaList = document.getElementById('file-name');

  mediaInput.addEventListener('change', () => {
    for (let i = 0; i < mediaInput.files.length; i++) {
      const file = mediaInput.files[i];
      allMedia.push(file);
    }
    updateMediaList();
  });

  function updateMediaList() {
    document.getElementById('image-preview-container').innerHTML = ''; // Clear existing previews
  
    allMedia.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = 'Preview';
  
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        preview.appendChild(img);
  
        const deleteIcon = document.createElement('div');
        deleteIcon.className = 'delete-icon';
        deleteIcon.innerHTML = '✖';
        deleteIcon.onclick = function() {
          URL.revokeObjectURL(img.src); 
          allMedia.splice(index, 1);
          updateMediaList();
        };
  
        preview.appendChild(deleteIcon);
        document.getElementById('image-preview-container').appendChild(preview);
      };
      reader.readAsDataURL(file);
    });
  }

  tweetButton.addEventListener('click', () => {
    const formData = new FormData();
    formData.append('text', tweetText.value);

    if (mediaInput.files.length > 0) {
      formData.append('media', mediaInput.files[0]);
    }

    fetch('/post_tweet', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Tweet posted successfully!');
      } else {
        alert('Failed to post tweet.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while posting the tweet.');
    });
  });

  document.getElementById('mediaButton').addEventListener('click', () => {
    mediaInput.click();
  });

  function resetForm() {
    tweetText.value = '';
    mediaInput.value = '';
    allMedia = [];
    updateMediaList();
  }
});
