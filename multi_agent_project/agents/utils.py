import datetime


ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class Agent:
    def __init__(self, name, type, description, key_terms, output_structure, group=None, print_line=False, auto_connect=False):
        self.name = name
        self.type = type
        self.description = description
        self.key_terms = key_terms
        self.output_structure = output_structure
        self.group = group
        self.print_line = print_line
        self.auto_connect = auto_connect
        self.created_by = "Admin"
        self.date_created = str(datetime.datetime.now())

    def to_dict(self):
        return {
            "name": self.name,
            "type": self.type,
            "description": self.description,
            "key_terms": self.key_terms,
            "output_structure": self.output_structure,
            "group": self.group,
            "print_line": self.print_line,
            "auto_connect": self.auto_connect,
            "created_by": self.created_by,
            "date_created": self.date_created,
        }
    
agent_list = [agent.to_dict() for agent in [
    Agent("Alias Name Agent", "Type 1", "Description of default agent 1", "Term 1, Term 2", "Structure 1"),
    Agent("Address Agent", "Type 2", "Description of default agent 2", "Term 3, Term 4", "Structure 2"),
    Agent("Dates Agent", "Type 3", "Description of default agent 3", "Term 5, Term 6", "Structure 3"),
]]