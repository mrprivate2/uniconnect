import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import API_BASE_URL from "../api";
import Navbar from "../components/Navbar";

export default function CampusFeed() {
  const navigate = useNavigate();
  // Redirect to the main Feed as this page seems redundant and uses non-standard components
  useEffect(() => {
    navigate("/feed");
  }, [navigate]);

  return null;
}