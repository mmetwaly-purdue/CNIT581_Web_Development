$(document).ready(function () {
    // Check if the user is already signed in
    var storedUsername = localStorage.getItem('username');

    if (storedUsername) {
        $('.auth-buttons').html(`<p>Hello, ${storedUsername}!</p>`);
        $('#userLogo').show(); // Make sure the user icon is visible
    } else {
        $('#userLogo').hide(); // Hide the user icon if not logged in
    }

    // Enable/Disable Group Name Input
    $('input[name="add-to-group"]').on('change', function () {
        if ($(this).val() === 'yes') {
            $('#group-name').prop('disabled', false);
        } else {
            $('#group-name').prop('disabled', true);
        }
    });

    // Function to create a new agent
    $('#createAgentButton').on('click', function () {
        // Collect form data
        const agentName = $('#agent-name').val().trim();
        const agentType = $('#agent-type').val().trim();
        const agentDescription = $('#agent-description').val().trim();
        const searchKeyTerms = $('#search-key-terms').val().trim();
        const outputStructure = $('#output-structure').val().trim();
        const addToGroup = $('input[name="add-to-group"]:checked').val() === 'yes';
        const groupName = addToGroup ? $('#group-name').val().trim() : '';
        const printLine = $('input[name="print-line"]:checked').val() === 'yes';
        const autoConnect = $('input[name="auto-connect"]:checked').val() === 'yes';

        // Check if agent name is provided
        if (agentName === '') {
            alert('Please enter a name for the agent.');
            return;
        }

        // Create an object to store the agent data
        const newAgent = {
            name: agentName,
            type: agentType,
            description: agentDescription,
            keyTerms: searchKeyTerms,
            output: outputStructure,
            group: addToGroup ? groupName : null,
            printLine: printLine,
            autoConnect: autoConnect
        };

        // Retrieve existing agents from localStorage
        let agents = JSON.parse(localStorage.getItem('agents')) || [];

        // Add the new agent to the agents array
        agents.push(newAgent);

        // Store the updated agents array in localStorage
        localStorage.setItem('agents', JSON.stringify(agents));

        // Provide user feedback with a popup
        alert('Agent created successfully!');

        // Clear the form fields after creation
        $('#agent-name').val('');
        $('#agent-type').val('');
        $('#agent-description').val('');
        $('#search-key-terms').val('');
        $('#output-structure').val('');
        $('input[name="add-to-group"]').prop('checked', false);
        $('#group-name').val('').prop('disabled', true);
        $('input[name="print-line"]').prop('checked', false);
        $('input[name="auto-connect"]').prop('checked', false);

        // Optionally, add the new agent directly to the agents page if open
        if ($('.agents-container').length) {
            addAgentButton(newAgent, agents.length - 1);
        }
    });

    // Function to dynamically load agents on the Agents page
    function loadAgents() {
        // Retrieve existing agents from localStorage
        const agents = JSON.parse(localStorage.getItem('agents')) || [];

        // Loop through agents and create buttons for each
        agents.forEach((agent, index) => {
            addAgentButton(agent, index);
        });
    }

    // Function to create and append an agent button
    function addAgentButton(agent, index) {
        const agentButton = $('<button></button>')
            .addClass('agent-button')
            .text(agent.name)
            .attr('data-index', index); // Optional: add data-index for reference

        // Append to agents container
        $('.agents-container').append(agentButton);
    }

    // Load agents if we are on the agents page
    if ($('.agents-container').length) {
        loadAgents();
    }

    // Rest of the existing code (authentication, delete agent, etc.) remains the same...
});
