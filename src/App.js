import { useState, useEffect } from 'react'
import Notification from './components/Notification'
import Error from './components/Error'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [newTitle, setNewTitle] = useState([])
  const [newAuthor, setNewAuthor] = useState([])
  const [newUrl, setNewUrl] = useState([])
  const [username, setUsername] = useState('') 
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )  
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })

      window.localStorage.setItem(
        'loggedBlogAppUser', JSON.stringify(user)
      ) 
      setUser(user)
      setUsername('')
      setPassword('')
      blogService.setToken(user.token)
    } catch (exception) {
        setErrorMessage('Wrong Login Credentials')
        setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogAppUser')
    setUser(null)
  }

  const addBlog = (event) => {
    event.preventDefault()
    const blogObject = {
      title: newTitle,
      author: newAuthor,
      url: newUrl      
    }

    blogService
      .create(blogObject)
      .then(response => {
        setBlogs(blogs.concat(response.data))
        setNotificationMessage(`Created new blog ${newTitle} by ${newAuthor}`)
        setTimeout(() => {
          setNotificationMessage(null)
        }, 5000)
        setNewTitle('')
        setNewAuthor('')
        setNewUrl('')
        
      })
  }
  const handleTitleChange = (event) => {
    setNewTitle(event.target.value)
  }
  const handleAuthorChange = (event) => {
    setNewAuthor(event.target.value)
  }
  const handleUrlChange = (event) => {
    setNewUrl(event.target.value)
  }

  const loginForm = () => {
    return(
      <form onSubmit={handleLogin}>
        <div>
          username
            <input
            type="text"
            value={username}
            name="Username"
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
            <input
            type="password"
            value={password}
            name="Password"
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    )
  }

  const userBlogs = () => {
    return(
      <div>
        <h3>{user.name} is logged in.</h3>
        <button onClick={handleLogout}> Logout </button>
        <h3>Create New:</h3>

        <form onSubmit={addBlog}>
          Title:
          <input
            value={newTitle}
            onChange={handleTitleChange}
          />
          Author:
          <input
            value={newAuthor}
            onChange={handleAuthorChange}
          />
          Url:
          <input
            value={newUrl}
            onChange={handleUrlChange}
          />
          <button type="submit">save</button>
        </form> 

        {blogs.map(blog =>
          <Blog key={blog.id} blog={blog} />
        )}
      </div>
    )
  }

  return (
    <div>
      <h2>Blogs</h2>
      <Notification message={notificationMessage} />
      <Error errorMessage={errorMessage} />
      {user === null ?
      loginForm() :
      userBlogs()
    }
      
    </div>
  )
}

export default App
