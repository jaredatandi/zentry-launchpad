import { Link, Route, Routes } from "react-router-dom";
import { AdminLayout, PublicLayout, RequireAuth } from "./components";
import { Contact, Demo, Guide, Home, LaunchPage } from "./pages/PublicPages";
import {
  Activity,
  Clients,
  ClientDetail,
  Dashboard,
  Enquiries,
  Invoices,
  Leads,
  Login,
  PageEditor,
  Pages,
} from "./pages/AdminPages";

function NotFound() {
  return (
    <section className="block">
      <div className="narrow center">
        <h1>Page not found</h1>
        <p className="muted">That address does not exist on this site.</p>
        <Link className="btn" to="/">Back to Zentry</Link>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="holding-page" element={<Guide />} />
        <Route path="demo" element={<Demo />} />
        <Route path="launch-page" element={<LaunchPage />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="admin/login" element={<Login />} />
      <Route
        path="admin"
        element={<RequireAuth><AdminLayout /></RequireAuth>}
      >
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="pages" element={<Pages />} />
        <Route path="pages/:id" element={<PageEditor />} />
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="activity" element={<Activity />} />
      </Route>
    </Routes>
  );
}
