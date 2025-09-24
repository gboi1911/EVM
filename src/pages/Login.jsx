import { Form, Input, Button, Checkbox, Card } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onFinish = (values) => {
    console.log("Login success:", values);
    // TODO: Call your API here
  };

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleLogin = () => {
    // fake check
    if (username && password) {
      navigate("/home");
    } else {
      alert("Please enter username and password");
    }
  };

  return (
    <div className="flex h-screen w-screen">
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-emerald-500 to-slate-900 items-center justify-center">
        <div className="text-white text-center p-10">
          {/* App Logo */}
          <img
            src={logo}
            alt="EV Logo"
            className="w-32 mx-auto mb-6 drop-shadow-xl"
          />
          <h1 className="text-4xl font-bold mb-4">⚡ Drive the Future</h1>
          <p className="text-lg opacity-90">
            Manage your Electric Vehicle services with ease and efficiency.
          </p>
        </div>
      </div>

      {/* Right section (Login form) */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4 shadow-2xl rounded-2xl">
          {/* Logo inside login card */}
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="EV Logo" className="w-16 h-16 mb-2" />
            <h1 className="text-2xl md:text-3xl font-bold text-cyan-800 text-center">
              Welcome to EVD System
            </h1>
          </div>

          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
          >
            {/* Username */}
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Username"
                size="large"
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Item>

            {/* Password */}
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>

            {/* Remember Me */}
            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            {/* Submit */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleLogin}
              >
                Log in
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
