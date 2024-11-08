$(document).ready(function() {
    const apiUrl = 'https://usmanlive.com/wp-json/api/stories/';
    let isEditing = false;

    // Load stories when page loads
    loadStories();

    // Function to load all stories
    function loadStories() {
        $.ajax({
            url: apiUrl,
            method: 'GET',
            success: function(response) {
                if (Array.isArray(response)) {
                    displayStories(response);
                } else {
                    alert('Invalid response format from server');
                }
            },
            error: function(xhr, status, error) {
                if (xhr.status === 404) {
                    $('#storiesList').html('<p>No stories found.</p>');
                } else {
                    alert('Error loading stories: ' + error);
                }
            }
        });
    }

    // Function to display stories
    function displayStories(stories) {
        const storiesList = $('#storiesList');
        storiesList.empty();

        stories.reverse().forEach(story => {
            if (story.title && story.content) {
                const storyHtml = `
                    <div class="story-card" data-id="${story.id}">
                        <h3>${story.title}</h3>
                        <p>${story.content}</p>
                        <div class="story-actions">
                            <button class="btn btn-edit" onclick="editStory(${story.id}, '${story.title}', '${story.content}')">Edit</button>
                            <button class="btn btn-delete" onclick="deleteStory(${story.id})">Delete</button>
                        </div>
                    </div>
                `;
                storiesList.append(storyHtml);
            }
        });
    }

    // Updated form submission with validation
    $('#storyForm').submit(function(e) {
        e.preventDefault();
        
        const title = $('#title').val().trim();
        const content = $('#content').val().trim();

        // Validation for POST/PUT
        if (!title || !content) {
            alert('Both title and content are required!');
            return;
        }

        if (title.length < 3) {
            alert('Title must be at least 3 characters long');
            return;
        }

        if (content.length < 10) {
            alert('Content must be at least 10 characters long');
            return;
        }

        const storyData = { title, content };
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? apiUrl + $('#storyId').val() : apiUrl;

        $.ajax({
            url: url,
            method: method,
            data: storyData,
            success: function(response) {
                loadStories();
                resetForm();
            },
            error: function(xhr, status, error) {
                if (xhr.status === 400) {
                    alert('Invalid data provided. Please check your input.');
                } else if (xhr.status === 404) {
                    alert('Story not found.');
                } else {
                    alert('Error saving story: ' + error);
                }
            }
        });
    });

    // Updated delete function with validation
    window.deleteStory = function(id) {
        if (!id) {
            alert('Invalid story ID');
            return;
        }

        if (confirm('Are you sure you want to delete this story?')) {
            $.ajax({
                url: apiUrl + id,
                method: 'DELETE',
                success: function(response) {
                    loadStories();
                },
                error: function(xhr, status, error) {
                    if (xhr.status === 404) {
                        alert('Story not found or already deleted.');
                    } else {
                        alert('Error deleting story: ' + error);
                    }
                }
            });
        }
    }

    // Updated edit function with validation
    window.editStory = function(id, title, content) {
        if (!id || !title || !content) {
            alert('Invalid story data');
            return;
        }

        isEditing = true;
        $('#storyId').val(id);
        $('#title').val(title);
        $('#content').val(content);
        $('#formTitle').text('Edit Story');
        $('#cancelEdit').show();
    }

    // Handle cancel edit
    $('#cancelEdit').click(function() {
        resetForm();
    });

    // Function to reset form
    function resetForm() {
        isEditing = false;
        $('#storyForm')[0].reset();
        $('#storyId').val('');
        $('#formTitle').text('Add New Story');
        $('#cancelEdit').hide();
    }
}); 