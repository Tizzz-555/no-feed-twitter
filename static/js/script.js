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
    let fileListHtml = "";
    for (let i = 0; i < allMedia.length; i++) {
      const imgSrc = URL.createObjectURL(allMedia[i]);
      fileListHtml += `<div style='display: flex; align-items: center; margin-bottom: 8px;'>
                        <img src='${imgSrc}' style='width: 50px; height: 50px; object-fit: cover; margin-right: 10px;' alt='Preview'>
                        ${i + 1}. ${allMedia[i].name}
                        <a href='#' class='delete-file' data-file-index='${i}' aria-label='Delete image'>
                          <svg class='icon icon-primary icon-sm mb-1'>
                            <use href='#it-close'></use>
                          </svg>
                        </a>
                      </div>`;
    }
    mediaList.innerHTML = fileListHtml;

    document.querySelectorAll('.delete-file').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const fileIndex = parseInt(item.getAttribute('data-file-index'));
        URL.revokeObjectURL(allMedia[fileIndex]);
        allMedia.splice(fileIndex, 1); // Remove file from array
        updateMediaList(); // Update the file list
      });
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
