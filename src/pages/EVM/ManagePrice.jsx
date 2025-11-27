import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  Space,
  Popconfirm,
  notification,
  Card,
  Select,
  DatePicker,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  getPriceListByLevel,
  getPriceDetailsById,
  updatePriceById,
  createPrice,
  deletePriceById,
  getAllPricePrograms,
} from "../../api/price";
import moment from "moment";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const dealerOptions = [
  { label: "Đại lý 1", value: 1 },
  { label: "Đại lý 2", value: 2 },
  { label: "Đại lý 3", value: 3 },
];

export default function ManagePrice() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    fetchPrices(selectedLevel);
  }, [selectedLevel]);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const response = await getAllPricePrograms();
      // Nếu API trả về object chứa priceProgramGetDtoList
      const prices = response.priceProgramGetDtoList || [];
      setData(prices);
    } catch (error) {
      notification.error({ message: "Failed to fetch prices!" });
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (record) => {
    setDetailData(record.programDetails || []);
    setDetailOpen(true);
  };

  const openModal = async (record = null) => {
    setEditing(record);
    setModalOpen(true);

    if (record) {
      const details = await getPriceDetailsById(record.priceProgramId);

      form.setFieldsValue({
        dealerHierarchy: details.dealerHierarchy,
        startDate: moment(details.startDay),
        endDate: moment(details.endDay),
      });
    } else {
      const now8am = moment().set({
        hour: 7,
        minute: 0,
        second: 0,
        millisecond: 0,
      });

      form.setFieldsValue({
        dealerHierarchy: null,
        startDate: now8am,
        endDate: now8am.clone().add(30, "days"),
      });
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const startDay = values.startDate.toISOString();
      const endDay = values.endDate.toISOString();

      const requestBody = {
        dealerHierarchy: values.dealerHierarchy,
        startDay,
        endDay,
      };

      if (editing) {
        // Update
        await updatePriceById(editing.priceProgramId, requestBody);

        setData((prev) =>
          prev.map((item) =>
            item.priceProgramId === editing.priceProgramId
              ? {
                  ...item,
                  dealerHierarchy: values.dealerHierarchy,
                  startDate: startDay,
                  endDate: endDay,
                }
              : item
          )
        );

        notification.success({ message: "Cập nhật thành công!" });
      } else {
        // Create
        const added = await createPrice(requestBody);

        setData((prev) => [
          ...prev,
          {
            ...added,
            startDate: startDay,
            endDate: endDay,
          },
        ]);

        notification.success({ message: "Thêm mới thành công!" });
      }

      setModalOpen(false);
      setEditing(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    setLoading(true);
    await deletePriceById(id);
    setData((prev) => prev.filter((item) => item.priceProgramId !== id));
    notification.success({ message: "Xóa thành công!" });
    setLoading(false);
  };

  const columns = [
    {
      title: "Mã chương trình",
      dataIndex: "priceProgramId",
      key: "priceProgramId",
      width: 80,
    },
    {
      title: "Tên chương trình",
      dataIndex: "priceProgramName",
      key: "priceProgramName",
    },
    {
      title: "Ngày hiệu lực",
      dataIndex: "effectiveDate",
      key: "effectiveDate",
      render: (text) => moment(text).utcOffset(7).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (value) =>
        value ? (
          <Tag color="green">Đang hoạt động</Tag>
        ) : (
          <Tag color="red">Đã kết thúc</Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          {/* <Button
            icon={<EyeOutlined />}
            onClick={() => openDetail(record)}
            type="link"
          >
            Xem
          </Button> */}
          <Button
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            type="link"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleRemove(record.priceProgramId)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
          <Button
            type="link"
            onClick={() =>
              navigate(`/homeEVM/price-detail/${record.priceProgramId}`)
            } // Navigate to price detail page
          >
            Chi tiết giá
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 py-8 flex items-center justify-center">
      <Card
        className="w-full max-w-7xl mx-auto shadow"
        style={{ minHeight: "80vh", width: "100%" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-emerald-700">
            Quản lý giá sỉ, chiết khấu, khuyến mãi theo đại lý
          </h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Thêm mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="priceProgramId"
          loading={loading}
          pagination={{ pageSize: 6 }}
        />
      </Card>

      <Modal
        title={editing ? "Cập nhật thông tin" : "Thêm mới chương trình giá"}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText={editing ? "Cập nhật" : "Thêm mới"}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Đại lý"
            name="dealerHierarchy"
            rules={[{ required: true, message: "Vui lòng chọn đại lý!" }]}
          >
            <Select options={dealerOptions} placeholder="Chọn đại lý" />
          </Form.Item>

          <Form.Item
            label="Ngày bắt đầu"
            name="startDate"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>

          <Form.Item
            label="Ngày kết thúc"
            name="endDate"
            rules={[
              { required: true, message: "Vui lòng chọn ngày kết thúc!" },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Chi tiết giá"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        <Table
          columns={[
            { title: "Mẫu xe", dataIndex: "carModelName" },
            { title: "Giá tối thiểu", dataIndex: "minPrice" },
            { title: "Giá đề xuất", dataIndex: "suggestedPrice" },
            { title: "Giá tối đa", dataIndex: "maxPrice" },
          ]}
          dataSource={detailData}
          rowKey="id"
          pagination={false}
        />
      </Modal>
    </div>
  );
}
