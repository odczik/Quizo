import { Select } from "~/components/Select";
import { Button } from "~/components/Button";
import { useState, useEffect } from "react";
import { apiClient } from "~/utils/api";
import { useAuth } from "~/context/AuthenticationContext";
import { useNavigate } from "react-router";