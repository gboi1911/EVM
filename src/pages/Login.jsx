import { Form, Input, Button, Checkbox, Card } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";
import { login } from "../api/authen";
import { App as AntdApp } from "antd"; // Import Ant Design App Component và đổi tên
import { useAuth } from "../context/AuthContext";
export default function Login() {
    const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { notification } = AntdApp.useApp();

  // useEffect(() => {
  //   const rememberedUsername = localStorage.getItem("remembered_username");
  //   const rememberedPassword = localStorage.getItem("remembered_password");
  //   if (rememberedUsername && rememberedPassword) {
  //     form.setFieldsValue({
  //       username: rememberedUsername,
  //       password: rememberedPassword,
  //       remember: true,
  //     });
  //     setUsername(rememberedUsername);
  //     setPassword(rememberedPassword);
  //   }
  // }, [form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
        const user = await login(values.username, values.password);
      if (values.remember) {
        localStorage.setItem("remembered_username", values.username);
        localStorage.setItem("remembered_password", values.password);
      } else {
        localStorage.removeItem("remembered_username");
        localStorage.removeItem("remembered_password");
      }
      notification.success({
        message: "Đăng nhập thành công!",
        description: "Chào mừng bạn đến với hệ thống EVD.",
        placement: "topRight",
      });
      if (user.role === "EVM_ADMIN" || user.role === "EVM_STAFF") {
        navigate("/homeEVM");
      } else if (
        user.role === "DEALER_MANAGER" ||
        user.role === "DEALER_STAFF"
      ) {
        navigate("/homeDealer");
      }
    } catch (error) {
      console.log("Login error:", error);
      if (error.message === "401" || error.message.includes("401")) {
        notification.error({
          message: "Đăng nhập thất bại!",
          description: "Sai tài khoản hoặc mật khẩu.",
          placement: "topRight",
        });
      } else {
        notification.error({
          message: "Đăng nhập thất bại!",
          description: "Login failed! Please check your credentials.",
          placement: "topRight",
        });
      }
    } finally {
      setLoading(false);
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
            // form={form}
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
                loading={loading}
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
