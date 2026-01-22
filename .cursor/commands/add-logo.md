# Add Logo Command

Create new content files for travel brand logos.

## Overview
When new logos are added to `src/content/logos`, this command detects directories without JSON metadata files, performs web research on the travel brand, and creates a properly formatted JSON file with brand information.

## Steps

1. **Scan for new logo directories**:
   - List all directories in `src/content/logos`
   - Identify directories that contain SVG files but are missing a corresponding JSON file
   - The JSON file should be named `{directory-name}.json` (e.g., `a-five.json` for the `a-five/` directory)

2. **For each new logo directory found**:
   - Extract the brand name from the directory name (convert kebab-case/hyphens to readable format)
   - Example: `a-five` → "A-Five", `qatar-airways` → "Qatar Airways"

3. **Check existing tags**:
   - **CRITICAL**: Before assigning tags, scan all existing JSON files in `src/content/logos` to identify existing tags
   - **DO NOT create new tags** - only use tags that already exist in other logo JSON files
   - Existing tags include:
     - "Airlines"
     - "Travel Tech & Platforms"
     - "TOs & Travel Agencies"
     - "Aviation & Travel Services"
     - "Web3 & Innovation"
     - "Sustainability & Nonprofits"
     - "Insurance & Finance"
   - Select the most appropriate existing tag(s) based on the company's business type
   - Companies can have multiple tags (e.g., ["Travel Tech & Platforms", "TOs & Travel Agencies"])

4. **Perform web research**:
   - Use web search to find information about the travel brand
   - Search query should be: "{brand name} travel brand" or "{brand name} travel company"
   - Gather the following information:
     - **Name**: Official brand name (use proper capitalization)
     - **Description**: A comprehensive description (2-3 sentences) about what the company does, its services, and its role in the travel industry
     - **Country**: Country where the company is headquartered or primarily operates
     - **Founded**: Year the company was founded (as a string, e.g., "2010")
     - **Tags**: Array of relevant tags - **MUST use only existing tags from step 3**
     - **Website**: Official website URL (with https://)
     - **added**: Current date in YYYY-MM-DD format
     - **lastModified**: Current date in YYYY-MM-DD format

5. **Verify information accuracy**:
   - Cross-reference multiple sources if needed
   - Ensure the description accurately reflects the company's business
   - Verify the website URL is correct
   - Confirm the country and founding year are accurate
   - **Verify tags**: Double-check that all tags used are from the existing tag list (no new tags created)

6. **Create the JSON file**:
   - Create `{directory-name}.json` inside the logo directory
   - Use the exact structure from `src/content/logos/a-five/a-five.json` as a template
   - Format the JSON with proper indentation (2 spaces)
   - Include all required fields:
     ```json
     {
       "name": "...",
       "description": "...",
       "country": "...",
       "founded": "...",
       "tags": [...],
       "website": "...",
       "added": "YYYY-MM-DD",
       "lastModified": "YYYY-MM-DD"
     }
     ```

7. **Quality checks**:
   - Ensure the description is informative and specific to the travel industry
   - Verify all dates are in correct format
   - **CRITICAL**: Verify that all tags exist in other JSON files - if a tag doesn't exist elsewhere, replace it with the closest matching existing tag
   - Confirm website URL is valid format
   - Make sure country name is properly capitalized

## Important Notes

- **Accuracy is critical**: Always verify information from multiple sources when possible
- **Description quality**: Write detailed, informative descriptions that explain what the company does in the travel industry
- **Tag consistency**: **MANDATORY** - Only use tags that already exist in other logo JSON files. Scan existing files first, then select from the existing tag list. Never create new tags.
- **Date format**: Always use YYYY-MM-DD format for dates
- **Website format**: Always include the full URL with https:// protocol
- **Name formatting**: Use proper capitalization and spacing (e.g., "A-Five", "Qatar Airways", "Holiday Check")

## Example

If a new directory `new-airline/` is found with SVG files but no `new-airline.json`:
1. Extract brand name: "New Airline"
2. Search: "New Airline travel brand"
3. Research and gather: name, description, country, founded year, tags, website
4. Create `src/content/logos/new-airline/new-airline.json` with all fields populated accurately
