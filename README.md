# Platform Standards Viewer

A modern, sleek web application for viewing and filtering platform standards defined in a YAML file. Built with modern web technologies and designed to be deployed on GitLab Pages.

## Features

- **Modern UI**: Clean, responsive design inspired by Shadcn UI and Tailwind CSS
- **Dynamic Loading**: Standards are loaded directly from a YAML file, making it easy to update without changing the code
- **Advanced Filtering**: Filter standards by category or use the search box to find specific standards across all fields
- **Sortable Table**: Click on any column header to sort the standards
- **Detailed View**: Comprehensive view of each standard with all its properties
- **Responsive Design**: Works well on desktop and mobile devices
- **GitLab Pages Ready**: Easy to deploy on GitLab Pages

## How to Use

1. **Setup**: Simply place all files in a directory served by a web server or deploy to GitLab Pages
2. **Update Standards**: Edit the `standards.yml` file to add, modify, or remove standards
3. **View in Browser**: Open `index.html` in a web browser

## File Structure

- `index.html` - The main HTML file with Tailwind CSS for modern UI
- `styles.css` - Custom CSS styles for the application
- `app.js` - JavaScript code that loads and displays the standards
- `standards.yml` - YAML file containing the standards data

## YAML Structure

The `standards.yml` file should follow this structure:

```yaml
standards:
  - identifier: "standard-id"
    name: "Standard Name"
    description: "Description of the standard"
    category: "category-name"
    mandatory: true/false
    effective_date: "YYYY-MM-DD"
    applicability: 
      - "item1"
      - "item2"
    big_rocks:
      - "item1"
      - "item2"
    criteria:
      - "criterion1"
      - "criterion2"
    rationale:
      - "rationale1"
      - "rationale2"
    outstanding_questions:
      - "question1"
      - "question2"
```

## Deploying to GitLab Pages

To deploy this application to GitLab Pages:

1. Push your code to a GitLab repository
2. Create a `.gitlab-ci.yml` file in the root of your repository with the following content:

```yaml
pages:
  stage: deploy
  script:
    - mkdir .public
    - cp -r *.html *.css *.js *.yml .public
    - mv .public public
  artifacts:
    paths:
      - public
  only:
    - main  # or master, depending on your default branch
```

3. Commit and push the CI file to your repository
4. GitLab CI will automatically deploy your site to GitLab Pages
5. Your site will be available at `https://<username>.gitlab.io/<repository-name>/`

## Local Development

To run this application locally:

1. Clone or download the repository
2. Serve the files using a local web server:
   - Python: `python3 -m http.server`
   - Node.js: Install `http-server` and run `http-server`
3. Open your browser and navigate to the local server (typically http://localhost:8000)

## Browser Compatibility

This application uses modern JavaScript and CSS features and should work in all recent browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Customization

- Edit `styles.css` to change the appearance
- Modify the table columns in `index.html` to show different fields
- Update the JavaScript in `app.js` to add new features or change existing behavior
- Change the color scheme by modifying the CSS variables in `styles.css` 