import React from "react";
import Layout from "./layout/Layout";
import { Routes, Route } from "react-router-dom";
import SearchPage from "./pages/SearchPage";
import SongDetails from "./pages/SongDetails";
import AlbumDetails from "./pages/AlbumDetails";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/song/:id" element={<SongDetails />} />
        <Route path="/album/:id" element={<AlbumDetails />} />
      </Routes>
    </Layout>
  );
}

export default App;
