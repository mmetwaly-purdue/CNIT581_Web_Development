$(document).ready(function () {
    // This is where your existing button logic and document ready logic starts
    const storedUsername = localStorage.getItem('username');
    const connections = []; // Store all connections
    const highlights = {};  // Store user highlights
    const agentColors = {}; // Store a consistent color per agent
    let ascending = true; // Variable to track sort order
    let summaryText = "";


    // Function to render agent buttons
    function renderAgentButtons() {
        const agentsContainer = $('.agents-container');
        agentsContainer.empty(); // Clear the container before appending

        if (typeof agent_list !== 'undefined' && agent_list.length > 0) {
            agent_list.forEach((agent, index) => {
                agentsContainer.append(`
                    <a href="/agent_detail/${index}">
                        <button class="agent-button">${agent.name}</button>
                    </a>
                `);
            });
        }
    }

    // Call the function to display the agents when the page loads
    renderAgentButtons();

    // Handle sorting when button is clicked
    $('#sort-button').on('click', function () {
        // Toggle between ascending and descending
        ascending = !ascending;

        // Sort the agent list based on the current sort order
        if (ascending) {
            agent_list.sort((a, b) => a.name.localeCompare(b.name)); // A-Z
            $(this).text('Sort: A-Z');
        } else {
            agent_list.sort((a, b) => b.name.localeCompare(a.name)); // Z-A
            $(this).text('Sort: Z-A');
        }

        // Re-render the agent buttons after sorting
        renderAgentButtons();

        // Clear existing agent buttons and repopulate them after sorting
        const agentsContainer = $('.agents-container');
        agentsContainer.empty();
        agent_list.forEach((agent, index) => {
            agentsContainer.append(`
                <a href="/agent_detail/${index}">
                    <button class="agent-button">${agent.name}</button>
                </a>
            `);
        });
    });
    
    // Handle adding a connection
    $('#addConnectionButton').on('click', function () {
        const connectionInput = $('#workflow-textarea').val();
        storeConnection('Add Connection', connectionInput);
    });

    // Handle deleting a connection
    $('#deleteConnectionButton').on('click', function () {
        const connectionInput = $('#workflow-textarea').val();
        const [agent1Text, agent2Text] = connectionInput.split(" AND ").map(str => str.trim());

        // Check if input is valid
        if (!agent1Text || !agent2Text) {
            alert("Enter agent names in the format: Agent1 AND Agent2");
            return;
        }

        // Find and remove the specified connection
        const connectionIndex = connections.findIndex(connection =>
            (connection.agent1 === agent1Text && connection.agent2 === agent2Text) ||
            (connection.agent1 === agent2Text && connection.agent2 === agent1Text)
        );

        if (connectionIndex !== -1) {
            // Remove the connection line from the DOM
            connections[connectionIndex].line.remove();

            // Remove the connection from the array
            connections.splice(connectionIndex, 1);

            alert(`Connection between ${agent1Text} and ${agent2Text} has been deleted.`);
        } else {
            alert("No such connection found. Please check the agent names.");
        }
    });



    // Delete agent logic (when "Delete Agent" mode is enabled)
    $('#delete-agent-mode').on('click', function () {
        deleteAgentMode(); // Call the function to delete agents
    });

    // Store connection function
    function storeConnection(buttonPressed, connectionText) {
        $.ajax({
            url: '/store_connection',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                button: buttonPressed,
                connection_text: connectionText
            }),
            success: function (response) {
                console.log(response.message);
                // Clear the input field after storing the connection
                $('#workflow-textarea').val('');
            },
            error: function (error) {
                console.error('Error:', error);
                alert('Failed to store connection.');
            }
        });
    }

    // Function to delete agent from the list based on name
    function deleteAgentMode() {
        const agentName = prompt("Enter the name of the agent you want to delete:");

        if (agentName !== null && agentName.trim() !== '') {
            // Find the index of the agent with the specified name
            const agentIndex = agent_list.findIndex(agent => agent.name.toLowerCase() === agentName.trim().toLowerCase());

            if (agentIndex !== -1) {
                // Remove the agent from agent_list
                agent_list.splice(agentIndex, 1);
                alert(`Agent "${agentName}" deleted successfully!`);
                
                // Re-render the agent buttons after deletion
                renderAgentButtons();
            } else {
                alert(`Agent "${agentName}" not found.`);
            }
        } else {
            alert('Please enter a valid agent name.');
        }
    }
    //---------------------------------------------------------------------------------------//
    $('#summaryButton').on('click', function () {
        displayFullSummary(); // Initial display of full summary
    });
   // Display the full summary
    function displayFullSummary() {
        let summaryContent = "";

        // Include highlights for each agent
        for (const agentName in highlights) {
            summaryContent += `Agent: ${agentName}\n`;
            highlights[agentName].forEach((highlight) => {
                summaryContent += `Text: "${highlight.text}", Start: ${highlight.start}, End: ${highlight.end}, Color: ${highlight.color}\n`;
            });
            summaryContent += "\n"; // Add spacing between agents
        }

        // Include connections between agents
        if (connections.length > 0) {
            summaryContent += "Connections:\n";
            connections.forEach((connection) => {
                summaryContent += `Agent ${connection.agent1} <-> Agent ${connection.agent2}\n`;
                summaryContent += `Connection Texts: "${connection.highlightText1}" and "${connection.highlightText2}", Color: ${connection.color}\n\n`;
            });
        }

        $('#summary-textarea').val(summaryContent || "No highlights or connections available.");
    }

    // Filter connections only
    $('#filterConnections').on('click', function () {
        let summaryContent = "Connections:\n";
        connections.forEach((connection) => {
            summaryContent += `Agent ${connection.agent1} <-> Agent ${connection.agent2}\n`;
            summaryContent += `Connection Texts: "${connection.highlightText1}" and "${connection.highlightText2}", Color: ${connection.color}\n\n`;
        });
        $('#summary-textarea').val(summaryContent || "No connections available.");
    });

    // Filter highlights only
    $('#filterHighlights').on('click', function () {
        let summaryContent = "Highlights:\n";
        for (const agentName in highlights) {
            summaryContent += `Agent: ${agentName}\n`;
            highlights[agentName].forEach((highlight) => {
                summaryContent += `Text: "${highlight.text}", Start: ${highlight.start}, End: ${highlight.end}, Color: ${highlight.color}\n`;
            });
            summaryContent += "\n"; // Add spacing between agents
        }
        $('#summary-textarea').val(summaryContent || "No highlights available.");
    });

    // Filter by agent name
    $('#filterAgent').on('click', function () {
        const agentName = $('#filterAgentInput').val().trim();
        if (!agentName) return;

        let summaryContent = `Highlights and Connections for Agent: ${agentName}\n`;

        // Check for highlights
        if (highlights[agentName]) {
            summaryContent += "Highlights:\n";
            highlights[agentName].forEach((highlight) => {
                summaryContent += `Text: "${highlight.text}", Start: ${highlight.start}, End: ${highlight.end}, Color: ${highlight.color}\n`;
            });
        } else {
            summaryContent += "No highlights for this agent.\n";
        }

        // Check for connections
        const agentConnections = connections.filter(
            conn => conn.agent1 === agentName || conn.agent2 === agentName
        );
        if (agentConnections.length > 0) {
            summaryContent += "\nConnections:\n";
            agentConnections.forEach((connection) => {
                summaryContent += `Agent ${connection.agent1} <-> Agent ${connection.agent2}\n`;
                summaryContent += `Connection Texts: "${connection.highlightText1}" and "${connection.highlightText2}", Color: ${connection.color}\n\n`;
            });
        } else {
            summaryContent += "No connections for this agent.\n";
        }

        $('#summary-textarea').val(summaryContent);
    });



    //---------------------------------------------------------------------------------------//
    if (storedUsername) {
        $('.auth-buttons').html(`<p>Hello, ${storedUsername}!</p>`);
        $('#userLogo').show();
        $('.workflow-agent-grid').show();
    } else {
        $('#userLogo').hide();
        $('.workflow-agent-grid').hide();
    }

    // Show Logout Popup on User Icon Click
    $('#userLogo').on('click', function () {
        $('#logoutPopup').toggle();
    });

    // Sign-In & Register Modal Logic
    $('#signInBtn').on('click', function () {
        $('#signInModal').css('display', 'flex');
    });

    $('#registerBtn').on('click', function () {
        $('#registerModal').css('display', 'flex');
    });

    $('#closeSignIn').on('click', function () {
        $('#signInModal').css('display', 'none');
    });

    $('#closeRegister').on('click', function () {
        $('#registerModal').css('display', 'none');
    });

    //---------------------------------------------------------------------------------------//
    $(window).on('click', function (event) {
        if (event.target === document.getElementById('signInModal')) {
            $('#signInModal').css('display', 'none');
        }
        if (event.target === document.getElementById('registerModal')) {
            $('#registerModal').css('display', 'none');
        }
    });

    //---------------------------------------------------------------------------------------//
    // Handle Register Form Submission
    $('#registerForm').on('submit', function (event) {
        event.preventDefault();
        const username = $('#registerUsername').val();
        const password = $('#registerPassword').val();
        const email = $('#registerEmail').val();

        $.ajax({
            url: '/register',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password, email }),
            success: function (response) {
                if (response.message === "User registered successfully") {
                    alert("Registration successful!");
                    $('#registerModal').css('display', 'none');
                    localStorage.setItem('username', username);
                    $('.auth-buttons').html(`<p>Hello, ${username}!</p>`);
                    $('#userLogo').show();
                    $('.workflow-agent-grid').show();
                } else {
                    alert(response.message);
                }
            },
            error: function (error) {
                console.error('Error:', error);
                alert('Failed to register. Please try again.');
            }
        });
    });

    // Handle Sign-In Form Submission
    $('#signInForm').on('submit', function (event) {
        event.preventDefault();
        const username = $('#signInUsername').val();
        const password = $('#signInPassword').val();

        $.ajax({
            url: '/signin',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password }),
            success: function (response) {
                if (response.message === "Signed in successfully") {
                    alert("Sign in successful!");
                    $('#signInModal').css('display', 'none');
                    localStorage.setItem('username', username);
                    $('.auth-buttons').html(`<p>Hello, ${username}!</p>`);
                    $('#userLogo').show();
                    $('.workflow-agent-grid').show();
                } else {
                    alert("Invalid username or password");
                }
            },
            error: function (error) {
                console.error('Error:', error);
                alert('Failed to sign in. Please try again.');
            }
        });
    });

    //---------------------------------------------------------------------------------------//
   // Apply highlight to agent names in the header
    function highlightAgentName(agentBox, color) {
        const header = $(agentBox).find('h4');
        const agentName = header.text();
        header.html(`<span style="background-color:${color};">${agentName}</span>`);
    }

    // Add Connection with consistent color for connected agents
    $('.workflow-action-button').eq(0).on('click', function () {
        const connectionInput = $('#workflow-textarea').val();
        const [agent1Text, agent2Text] = connectionInput.split(" AND ").map(str => str.trim());
    
        // Find agent boxes based on agent names
        const agentBox1 = $(`.workflow-agent-box:contains("${agent1Text}")`).first();
        const agentBox2 = $(`.workflow-agent-box:contains("${agent2Text}")`).first();
    
        if (agentBox1.length && agentBox2.length) {
            // Assign or reuse a color for this connection
            const connectionColor = agentColors[agent1Text] || getRandomColor();
            agentColors[agent1Text] = connectionColor;
            agentColors[agent2Text] = connectionColor;
    
            // Highlight both agent names in headers with the same color
            highlightAgentName(agentBox1, connectionColor);
            highlightAgentName(agentBox2, connectionColor);
    
            // Draw line between connected agents
            const line = $('<div class="connection-line"></div>').css({
                background: connectionColor,
                height: '2px'
            });
            $('body').append(line);
            drawLine(line, agentBox1, agentBox2);
    
            // Retrieve highlights for these agents
            const agent1Highlights = highlights[agent1Text] || [];
            const agent2Highlights = highlights[agent2Text] || [];
    
            // Add the connection to the connections array
            connections.push({
                line,
                agent1: agent1Text,
                agent2: agent2Text,
                highlightText1: agent1Highlights.map(h => h.text).join(', '),
                highlightText2: agent2Highlights.map(h => h.text).join(', '),
                color: connectionColor
            });
            
            console.log(`Connection added between ${agent1Text} and ${agent2Text} with color ${connectionColor}`);
        } else {
            alert("Enter valid agent names in format: Agent1 Text AND Agent2 Text.");
        }
    })

    // Draw a line between two agent boxes
    function drawLine(line, box1, box2) {
        const pos1 = box1.offset();
        const pos2 = box2.offset();
        const x1 = pos1.left + box1.outerWidth() / 2;
        const y1 = pos1.top + box1.outerHeight() / 2;
        const x2 = pos2.left + box2.outerWidth() / 2;
        const y2 = pos2.top + box2.outerHeight() / 2;

        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

        line.css({
            left: `${x1}px`,
            top: `${y1}px`,
            width: `${length}px`,
            transform: `rotate(${angle}deg)`,
            transformOrigin: '0 0'
        });
    }

    // ** Hide All Connections **
    $('.workflow-action-button').eq(4).on('click', function () {
        connections.forEach(connection => {
            connection.line.toggle(); // Toggle visibility
        });
    });

    // ** Highlight All Connections in Red **
    $('.workflow-action-button').eq(2).on('click', function () {
        connections.forEach(connection => {
            connection.line.css('background', 'red');
        });
    });
    
    //---------------------------------------------------------------------------------------//
    // ** Open Delete Agent Modal when button is clicked **
    $('.workflow-action-button').eq(3).on('click', function () {
        $('#deleteAgentModal').show(); // Display the modal to confirm deletion
    });

    // ** Confirm Delete Agent by Name **
    $('#confirmDeleteAgent').on('click', function () {
        const agentToDelete = $('#agentToDelete').val().trim();
        const agentBox = $(`.workflow-agent-box:contains("${agentToDelete}")`).filter(function() {
            return $(this).text().includes(agentToDelete);
        }).first();

        if (agentBox.length) {
            // Remove associated connections
            connections.forEach((connection, index) => {
                if (connection.agent1Text === agentToDelete || connection.agent2Text === agentToDelete) {
                    connection.line.remove(); // Remove the line from the DOM
                    connections.splice(index, 1); // Remove connection from the array
                    console.log(`Connection removed for agent: ${agentToDelete}`);
                }
            });

            // Remove the agent box itself
            agentBox.remove();
            $('#deleteAgentModal').hide();
            $('#agentToDelete').val(''); // Clear input after deletion

            console.log(`Agent ${agentToDelete} and associated connections deleted.`);
        } else {
            alert("Agent not found. Please enter the correct agent name.");
        }
    })

    // Close Delete Agent Modal
    $('#closeDeleteAgentModal').on('click', function () {
        $('#deleteAgentModal').hide();
        $('#agentToDelete').val(''); // Clear input when closed
    });

    //---------------------------------------------------------------------------------------//
    // Function to generate a random color
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function applyHighlight(agentBox, start, end, color) {
        const documentContent = $(agentBox).find('.document-content')[0];
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            const selectedText = range.toString();
            span.style.backgroundColor = color;
            span.classList.add('highlight');
            range.surroundContents(span);
            selection.removeAllRanges();
            saveHighlight(agentBox, selectedText, start, end, color);
        }
        console.log(`Highlight applied with color ${color}`);
    }
    
    // Event listener for text selection within any agent box
    $('.workflow-agent-box .document-content').on('mouseup', function () {
        const agentBox = $(this).closest('.workflow-agent-box');
        const agentName = agentBox.find('h4').text();
        const selection = window.getSelection();
    
        if (!selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const start = range.startOffset;
            const end = range.endOffset;
    
            // Use consistent color for each agent, generating one if agent does not already have a color
            if (!agentColors[agentName]) {
                agentColors[agentName] = getRandomColor();
            }
            const color = agentColors[agentName];
    
            applyHighlight(agentBox, start, end, color);
    
            // Save the highlight (session only for now)
            saveHighlight(agentName, start, end, color);
        }
    });

    function saveHighlight(agentBox, text, start, end, color) {
        const agentName = $(agentBox).find('h4').text();
        if (!highlights[agentName]) {
            highlights[agentName] = [];
        }
        highlights[agentName].push({ text, start, end, color });
        console.log(`Highlight saved for agent ${agentName}: Text "${text}", Start ${start}, End ${end}, Color ${color}`);
    }

    
    //---------------------------------------------------------------------------------------//

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
            key_terms: searchKeyTerms,
            output_structure: outputStructure,
            group: addToGroup ? groupName : null,
            print_line: printLine,
            auto_connect: autoConnect
        };

        // Send the data to the server via POST request
        $.ajax({
            url: '/create_agent',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newAgent),
            success: function (response) {
                alert('Agent created successfully!');
                
                // Refresh the page or redirect to the agents page to see the new agent
                window.location.href = "/agents";
            },
            error: function (error) {
                alert('Failed to create the agent. Please try again.');
            }
        });
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
        const agentButton = $('<a></a>')
            .attr('href', `/agent_detail/${index}`)
            .append($('<button></button>')
                .addClass('agent-button')
                .text(agent.name)
                .attr('data-index', index)); // Add data-index for reference

        // Append to agents container
        $('.agents-container').append(agentButton);
    }

    // Load agents if we are on the agents page
    if ($('.agents-container').length) {
        loadAgents();
    }

    //---------------------------------------------------------------------------------------//

    // Function to load document content into an agent box
    function loadDocumentContent(agentId, filePath) {
        $.get(filePath, function (data) {
            $(`#${agentId} .document-content`).text(data);
        });
    }

    //---------------------------------------------------------------------------------------//

    // Logout clears localStorage and hides workflow content
    $('#confirmLogout').on('click', function () {
        localStorage.removeItem('username');
        $('.auth-buttons').html(`
            <button id="signInBtn">Sign In</button>
            <button id="registerBtn">Register</button>
        `);
        $('#logoutPopup').hide();
        $('#userLogo').hide();
        $('.workflow-agent-grid').hide();
        initializeAuthButtons(); // Reattach event handlers
    });
    
    function initializeAuthButtons() {
        $('#signInBtn').on('click', function () {
            $('#signInModal').css('display', 'flex');
        });
    
        $('#registerBtn').on('click', function () {
            $('#registerModal').css('display', 'flex');
        });
    }

});
