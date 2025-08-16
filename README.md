# ScholarLink

ScholarLink is a responsive scholarship portal designed to connect students with funding opportunities around the world. This project includes a static front-end implementation that demonstrates the core functionality of a fully featured scholarship hub. Users can browse scholarships, view detailed information, submit new opportunities, bookmark favourites, subscribe to a newsletter, read blog posts, and interact with an admin dashboard (when logged in as an admin). All data in this demo is stored in the browser via localStorage.

## Features

1. **Home Page:** Welcome banner, featured scholarships, and newsletter subscription.
2. **Scholarship Listings:** Searchable and filterable list of scholarships (country, level, field, sponsor). Pagination is included.
3. **Scholarship Detail:** In-depth view with eligibility, benefits, description, official link, and social sharing buttons.
4. **Submission Form:** Authenticated users can submit new scholarships. Submissions are stored locally and require admin approval.
5. **User Authentication:** Simple email/password registration and login stored in localStorage. Users can bookmark scholarships.
6. **Admin Dashboard:** Manage pending submissions, approved scholarships, registered users, and newsletter subscribers.
7. **Newsletter:** Visitors can subscribe to a mailing list. Emails are stored locally for admin view.
8. **Contact Page:** Send a message to site administrators. Messages are stored locally.
9. **Blog:** A small blog system for tips and news. Posts are sourced from `posts.json`.

## Running Locally

Because the site fetches data from local JSON files, it must be served via an HTTP server (not opened directly from the file system) in order for `fetch()` to work. Follow these steps:

1. Ensure you have Python installed. Navigate to the `scholarlink_site` folder:

   ```sh
   cd scholarlink/scholarlink_site

Start a simple HTTP server (Python 3):

```sh
python3 -m http.server 8000
```
Open your browser and go to http://localhost:8000/index.html.

All user data (accounts, bookmarks, submissions, messages) persists only in your browser’s localStorage. Clearing your browser storage will reset the data.

Admin Account

To access the admin dashboard:

Method 1 (Automatic): Log in or register with the email admin@scholarlink.com. The patched script automatically grants this account admin rights.

Method 2 (Manual): If using the unpatched version, run this snippet in the browser console after creating the account:
```js
const users = JSON.parse(localStorage.getItem('users')); 
const admin = users.find(u => u.email === 'admin@scholarlink.com'); 
if (admin) { admin.isAdmin = true; localStorage.setItem('users', JSON.stringify(users)); } 
localStorage.setItem('currentUser', JSON.stringify({ email: 'admin@scholarlink.com', isAdmin: true }));
```
Reload the page and click the Admin link in the header to access management functions.

Limitations & Future Work

This demonstration is entirely client-side for ease of deployment in an environment without package installation. In a full production implementation you would:

Build a backend API using Express or Django connected to PostgreSQL or MongoDB.

Implement secure authentication via Firebase Auth or Auth0.

Store scholarship data in a real database and implement moderation queues.

Integrate email services such as Mailchimp for newsletter delivery.

Add accessibility features, proper SEO meta tags, and server-side rendering (e.g. with Next.js) for performance.

Nonetheless, this static prototype shows the user flows and UI components required for ScholarLink.
