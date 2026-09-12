import { API_BASE } from "./lib/apiBase";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ApiTester() {
  const [token, setToken] = useState<string>(localStorage.getItem("jwt_token") || "");
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpass123");
  const [name, setName] = useState("Test User");
  
  const [response, setResponse] = useState<any>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const makeRequest = async (endpoint: string, method: string, body?: object) => {
    setLoading(true);
    setResponse(null);
    setStatus(null);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      setStatus(res.status);
      const data = await res.json();
      setResponse(data);

      // Store token automatically on successful login/signup
      if (data.token) {
        setToken(data.token);
        localStorage.setItem("jwt_token", data.token);
      }
    } catch (err: any) {
      setStatus(500);
      setResponse({ error: err.message || "Failed to connect to backend" });
    } finally {
      setLoading(false);
    }
  };

  const clearToken = () => {
    setToken("");
    localStorage.removeItem("jwt_token");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">LAWSUIT Backend API Tester</h1>
          <p className="text-sm text-muted-foreground">Test auth, lawyer endpoints, and DB connectivity</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={token ? "default" : "outline"}>
            {token ? "Authenticated" : "No Token"}
          </Badge>
          {token && (
            <Button variant="ghost" size="sm" onClick={clearToken}>
              Clear Token
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Test Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">1. Authentication Endpoint Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Name (for Signup)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-md border bg-background"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-md border bg-background"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-md border bg-background"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="w-full"
                  size="sm"
                  disabled={loading}
                  onClick={() => makeRequest("/api/auth/signup", "POST", { name, email, password })}
                >
                  Test Signup
                </Button>
                <Button
                  className="w-full"
                  variant="secondary"
                  size="sm"
                  disabled={loading}
                  onClick={() => makeRequest("/api/auth/login", "POST", { email, password })}
                >
                  Test Login
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">2. Resource Endpoint Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => makeRequest("/api/lawyers", "GET")}
              >
                GET /api/lawyers (Fetch Lawyers)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Output Console */}
        <Card className="flex flex-col h-[420px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
            <CardTitle className="text-sm font-medium">Response Console</CardTitle>
            {status && (
              <Badge variant={status < 300 ? "default" : "destructive"}>
                HTTP {status}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-4 overflow-auto font-mono text-xs bg-muted/30">
            {loading ? (
              <p className="text-muted-foreground animate-pulse">Sending request...</p>
            ) : response ? (
              <pre className="whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
            ) : (
              <p className="text-muted-foreground">Click any endpoint on the left to inspect response.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
