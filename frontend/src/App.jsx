import { useEffect, useState } from "react";
import { LogOut, RefreshCw, Trash2, Upload, UserPlus } from "lucide-react";
import {
  clearToken,
  deletePost,
  getFeed,
  getToken,
  login,
  register,
  setToken,
  uploadPost,
} from "./api";

function AuthPanel({ onAuthenticated, onMessage }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "register") {
        await register(email, password);
        onMessage("Account created. Signing you in...");
      }
      const session = await login(email, password);
      setToken(session.access_token);
      onAuthenticated();
    } catch (error) {
      onMessage(error.message, true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-panel panel">
      <div className="eyebrow">Welcome back</div>
      <h2>{mode === "login" ? "Sign in to your feed" : "Create your account"}</h2>
      <p className="muted">Use your email to share and manage posts.</p>
      <form onSubmit={handleSubmit} className="stack">
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength="8" required />
        </label>
        <button className="primary" disabled={busy} type="submit">
          {busy ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
      <button className="link-button" type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
        <UserPlus size={16} /> {mode === "login" ? "Need an account? Register" : "Already registered? Sign in"}
      </button>
    </section>
  );
}

function Composer({ onUploaded, onMessage }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) return;
    setBusy(true);
    try {
      await uploadPost(file, caption);
      setFile(null);
      setCaption("");
      event.target.reset();
      onUploaded();
    } catch (error) {
      onMessage(error.message, true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel composer">
      <div><div className="eyebrow">Share something</div><h2>New post</h2></div>
      <form onSubmit={handleSubmit} className="stack">
        <input type="file" accept="image/*,video/*" onChange={(event) => setFile(event.target.files?.[0] || null)} required />
        <textarea value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Add a caption..." rows="3" />
        <button className="primary" disabled={busy || !file} type="submit"><Upload size={17} /> {busy ? "Uploading..." : "Upload post"}</button>
      </form>
    </section>
  );
}

function PostCard({ post, onDeleted, onMessage }) {
  async function handleDelete() {
    try {
      await deletePost(post.id);
      onDeleted();
    } catch (error) {
      onMessage(error.message, true);
    }
  }

  return (
    <article className="post-card">
      <div className="post-meta"><strong>{post.email}</strong><span>{new Date(post.created_at).toLocaleString()}</span></div>
      {post.file_type === "video" ? <video src={post.url} controls /> : <img src={post.url} alt={post.file_name} />}
      {post.caption && <p>{post.caption}</p>}
      {post.is_owner && <button className="icon-button danger" title="Delete post" onClick={handleDelete}><Trash2 size={17} /> Delete</button>}
    </article>
  );
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(getToken()));
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  function notify(text, isError = false) { setMessage(text); setError(isError); }
  async function loadFeed() {
    if (!getToken()) return;
    setLoading(true);
    try { const data = await getFeed(); setPosts(data.posts); notify(""); }
    catch (requestError) { notify(requestError.message, true); }
    finally { setLoading(false); }
  }
  function signOut() { clearToken(); setAuthenticated(false); setPosts([]); }

  useEffect(() => { loadFeed(); }, [authenticated]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>FeedSpace</button>
        <nav><a href="#feed">Feed</a><a href="#share">Share</a><a href="#about">About</a></nav>
        {authenticated ? <button className="ghost-button" onClick={signOut}><LogOut size={17} /> Sign out</button> : <span className="header-note">A place to share</span>}
      </header>
      <main>
        {!authenticated ? <><section className="hero"><div className="eyebrow">A small place to share</div><h1>Have your own place.</h1><p>Sign in to share images, videos, and moments with your community.</p></section><AuthPanel onAuthenticated={() => setAuthenticated(true)} onMessage={notify} /></> : <>
          <section className="hero" id="about"><div className="eyebrow">Your community</div><h1>Find what moves you.</h1><p>A quiet feed for the things worth keeping close.</p></section>
          <section className="workspace" id="share"><div className="steps"><span className="active">01 Share</span><span>02 Caption</span><span>03 Publish</span></div><Composer onUploaded={loadFeed} onMessage={notify} /></section>
          <section className="feed-section" id="feed"><div className="section-heading"><div><div className="eyebrow">The latest</div><h2>Moments from the community</h2></div><button className="icon-button" onClick={loadFeed} disabled={loading} title="Refresh feed"><RefreshCw size={17} /> Refresh</button></div>
            {message && <p className={error ? "notice error" : "notice"}>{message}</p>}
            {loading ? <p className="muted">Loading posts...</p> : posts.length ? posts.map((post) => <PostCard key={post.id} post={post} onDeleted={loadFeed} onMessage={notify} />) : <p className="empty-state">No posts yet. Upload the first one.</p>}
          </section>
        </>}
      </main>
    </div>
  );
}
