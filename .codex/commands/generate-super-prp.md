# Generate Template PRP

## Feature file: $ARGUMENTS

Generate a comprehensive PRP for creating context engineering templates for specific technology domains based on the detailed requirements in the taskmaster specific task file provided by the user for this operation/branch/step of our project. 

**CRITICAL: Web search and documentation research is your best friend. Use it extensively throughout this process.**

## Research Process

1. **Read and Understand Requirements**
   - Read the specified task_***.md file thoroughly
   - Understand the target technology and specific template requirements
   - Read and understand also the entire task list to deeply comprehend the specific application/use case of every component/service/technology involved in this task and all the implication/dependencies ( .taskmaster/docs/prd.txt  .taskmaster/tasks/tasks.json )
   - Note any specific features, examples, or documentation mentioned
   - Identify the complexity of the prp.

2. **Extensive Local (in repo) andWeb Research (CRITICAL)**
   - As first thing analyze the codebase to find documentation/context/knowledge file and folders. Start searching from .taskmaster/docs , /docs folders. Analyze also AGENTS.md and README.md file in root to get quick context about the stack (so about web searches to do). 
   - **Web search the target technology extensively** - this is essential also to verify/extend,  the infos contained in local documentation files, in order to have the best prp possible.
   - Study official documentation, APIs, and getting started guides
   - Research best practices and common architectural patterns
   - Find real-world implementation examples and tutorials
   - Identify common gotchas, pitfalls, and edge cases
   - Look for established project structure conventions

3. **Technology Pattern Analysis**
   - Examine successful implementations found through web research
   - Identify project structure and file organization patterns
   - Extract reusable code patterns and configuration templates
   - Document framework-specific development workflows
   - Note testing frameworks and validation approaches

4. **Context Engineering Adaptation**
   - Map discovered technology patterns to context engineering principles
   - Plan how to adapt the PRP framework for this specific technology
   - Design domain-specific validation requirements
  

## PRP Generation

Using .taskmaster/templates/prp_template_base.md as the foundation:

### Critical Context to Include from local/Web Research

**Technology Documentation (from web search)**:
- Official framework documentation URLs with specific sections
- Getting started guides and tutorials
- API references and best practices guides
- Community resources and example repositories

**Implementation Patterns (from research)**:
- Framework-specific project structures and conventions
- Configuration management approaches
- Development workflow patterns
- Testing and validation approaches

**Real-World Examples**:
- Links to successful implementations found online
- Code snippets and configuration examples
- Common integration patterns
- Deployment and setup procedures

### Implementation Blueprint

Based on web research findings:
- **Technology Analysis**: Document framework characteristics and patterns
- **Template Structure**: Plan complete template package components
- **Specialization Strategy**: How to adapt context engineering for this technology
- **Validation Design**: Technology-appropriate testing and validation loops

### Validation Gates (Must be Executable)

```bash
# Template Structure Validation
ls -la use-cases/{technology-name}/
find use-cases/{technology-name}/ -name "*.md" | wc -l  # Should have all required files

# Template Content Validation  
grep -r "TODO\|PLACEHOLDER" use-cases/{technology-name}/  # Should be empty
grep -r "WEBSEARCH_NEEDED" use-cases/{technology-name}/  # Should be empty

*** CRITICAL: Do extensive web research before writing the PRP ***
*** Use WebSearch tool extensively to understand the technology deeply ***

## Output

Save as: `.taskmaster/docs/prp-task{task-number}.md`

## Quality Checklist

- [ ] Extensive web research completed on target technology
- [ ] Official documentation thoroughly reviewed
- [ ] Real-world examples and patterns identified
- [ ] Complete template package structure planned
- [ ] Domain-specific validation designed
- [ ] All web research findings documented in PRP
- [ ] Technology-specific gotchas and patterns captured

Score the PRP on a scale of 1-10 (confidence level for creating comprehensive, immediately usable templates based on thorough technology research).