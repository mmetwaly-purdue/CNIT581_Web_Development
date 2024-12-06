
# Multi-Agent Sensemaking Web Application

## **Description**
This Django-based web application facilitates interactive workflows for analyzing text documents using multi-agent sensemaking. Users can create, manage, and connect agents that process document content based on user-defined criteria, enabling a collaborative analysis process.

---

## **Setup Instructions**

### **1. Clone the Repository**
Clone the project repository to your local machine:
```bash
git clone CNIT581_Web_Development
cd CNIT581_Web_Development/multi_agent_project
```

### **2. Install Python Dependencies**
Ensure you have Python installed. Use the provided `requirements.txt` file to install project dependencies:
```bash
pip install -r requirements.txt
```

### **3. Set Up the Django Environment**
Run the following commands to set up the Django environment:

- **Apply Migrations**:  
  This sets up the database.
  ```bash
  python manage.py migrate
  ```

### **4. Run the Local Development Server**
Start the Django development server:
```bash
python manage.py runserver
```

Access the application at: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

---

## **Usage Instructions**

### **Homepage**
Navigate to the homepage at [http://127.0.0.1:8000/](http://127.0.0.1:8000/). This page provides an overview of the application.

### **User Registration and Login**
1. **Register**:
   - Go to the homepage.
   - Click "Register" and provide a first name, last name, email, and password.
2. **Login**:
   - Use your username (first name) and password to log in.

---

### **Features**

#### **Documents Page**
- View uploaded documents in a grid layout.
- Hover over document buttons to see their content.
- Click on a document to view its full content.
- **Upload Documents**:  
  Upload `.txt` files only. These files will be available for analysis.

#### **Agents Page**
- View existing agents and their configurations.
- **Create Agents**:  
  Define an agent name, type, description, and the terms it should search for.
  Example: Create an agent that looks for countries. Name your agent "Country Agent".
- **Delete Agents**:
  You can delete any agent. Make sure that the name is accurate. 
- **Assign Agents to Documents**:
  - Select a document from the dropdown or upload a new one.
  - Click "Add to Workflow" to associate the agent with the document.

#### **Workflow Page**
- **Add Connections**:
  Connect agents to documents for collaborative sensemaking.
- **Edit Connections**:
  - Highlight, hide, or delete connections.
  - Delete agents (remove connections first).
- **Run Gemini**:
  Analyze documents using the assigned agents.
  - Highlight terms in documents based on the agent’s purpose.
- **Make Annotations**:
  Add your annotations to the agent-document block.
- **Generate Summary**:
  Produce a summary of annotations, connections, and workflows.

#### **Testing Use Case**
For testing, use the pre-uploaded documents and assign specific agents:
- Assign `name agent` to `cia11.txt`.
- Assign `address agent` to `cia31.txt`.
- Assign `location agent` to `cia33.txt`.
- Assign `name agent` to `cia35.txt`.
- Assign `date agent` to `cia39.txt`.

Repeat the process of adding agents and documents until your workflow is complete.

#### **Testing Use Case - continued**
Perform analysis on agent-document blocks.
- Make connections by selecting agent-document blocks from list.
- Edit said connections by selection connection form list.
- Delete agent-documentblock by selecting agent-document block from list. (Make sure to delete its connections beforehand)
- Run gemini on agent-document blocks. This will highlight the desired text. 
- Press on make annotations button after running gemini to make own annotations on text. 
---

## **Developer Notes**
- **Refreshing the Workflow Page**:
  If you encounter issues, use the refresh button to restart the workflow process.
- **File Format**:
  Only `.txt` files are supported for uploads.

---

## **Summary**
This application enables users to analyze text documents interactively through collaborative workflows. It combines the simplicity of document management with the power of multi-agent sensemaking.

For issues or further details, please refer to the documentation or contact the project administrator.
