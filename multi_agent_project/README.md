
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
If already installed, just:
```bash
cd CNIT581_Web_Development/multi_agent_project
```

### **2.1 Virtual Environment Activation**
Ensure to activate the virtual environment:
```bash
source venv/bin/activate
```
or
```cmd
venv/bin/activate
```
### **2.2 Install Python Dependencies**
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
The Multi-Agent Sensemaking Web Application is a groundbreaking tool designed to address the challenges of collaborative data analysis by integrating human expertise with the computational power of Large Language Models (LLMs). The platform’s development was guided by three overarching goals: enabling multi-agent collaboration, simplifying transitions from data exploration to actionable insights, and ensuring scalability and adaptability for diverse user needs.

At the core of the platform is the concept of multi-agent collaboration. By leveraging multiple LLM agents, the system provides users with tools to perform tasks such as document annotation, keyword extraction, and data pattern detection. These agents, configurable and customizable, enable a higher degree of precision and flexibility, allowing users to tackle complex datasets effectively. The application is designed to simplify transitions from data exploration to sensemaking, addressing a critical gap in existing tools that often fail to facilitate smooth workflows. Furthermore, the platform’s scalability ensures it can support a wide range of users and use cases, from academic research to industry-specific problem-solving.

The system is divided into key components, each contributing to its functionality and user experience. The Homepage introduces the platform and acts as an entry point for users. It features sections like "How It Works" and "Featured Workflows," which provide guidance and context, helping users familiarize themselves with the platform’s capabilities. This foundational orientation ensures that users, regardless of their technical expertise, can easily navigate the system and begin working on their tasks.

The Agents Page serves as the central hub for managing the platform’s multi-agent system. On this page, users can explore a list of available agents, filter them by relevance or accuracy, and group them according to specific tasks. This functionality empowers users to organize their workflows effectively, focusing on agents most suited to their objectives. By streamlining the agent selection process, the platform fosters efficient collaboration and task management.

Another critical component is the Agent Detail Page, which provides in-depth information about each agent’s role, output, and configuration. This page promotes transparency by giving users a clear view of how each agent contributes to the workflow and the data analysis process. It also supports collaboration, as agents can be shared among team members, encouraging joint efforts in sensemaking. The detailed insights offered by this page enhance user confidence in the system and its outputs.

The Workflow Page is the heart of the platform, offering a visual interface to manage and understand connections between agents. This page allows users to add, delete, and highlight connections, making it easier to identify patterns and relationships within datasets. By visualizing these connections, the Workflow Page helps users make sense of complex data structures and refine their workflows dynamically. This interactive feature is particularly valuable for identifying inconsistencies or uncovering trends that might otherwise go unnoticed.

The platform is built on a robust framework powered by LLMs, enabling advanced capabilities such as data annotation, keyword extraction, and pattern detection. This framework ensures efficient processing and flexibility, adapting to diverse user needs and datasets. The integration of customization, visualization, and collaboration features further strengthens the platform’s utility. Users can adjust agents to suit specific datasets, visualize relationships between agents for clarity, and collaborate with others to refine insights and outputs.

In summary, the Multi-Agent Sensemaking Web Application is a flexible, scalable, and user-friendly tool designed to bridge the gap between human expertise and AI capabilities. Its thoughtful design and robust features make it an invaluable resource for navigating and analyzing complex datasets. By addressing the challenges of multi-agent collaboration, exploration-to-sensemaking transitions, and scalability, the platform empowers users to extract meaningful insights efficiently and effectively.
