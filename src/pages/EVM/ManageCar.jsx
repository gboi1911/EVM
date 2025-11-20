import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Card,
  Descriptions,
  notification,
  InputNumber,
  Select,
  Tabs,
  Upload,
  Image,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  getAllCars,
  getCarDetails,
  updateCar,
  createCar,
  postImageForCar,
} from "../../api/car";
import { App as AntdApp } from "antd";

const { TabPane } = Tabs;

const driveTypeOptions = [
  { label: "FWD", value: "FWD" },
  { label: "RWD", value: "RWD" },
  { label: "AWD", value: "AWD" },
];

export default function ManageCar() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("create"); // 'create' | 'edit' | 'view'
  const [form] = Form.useForm();
  const { notification } = AntdApp.useApp();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // upload modal state (for adding images to an existing car row)
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadTargetCar, setUploadTargetCar] = useState(null);
  const [uploadFileList, setUploadFileList] = useState([]);

  const loadCars = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await getAllCars(page - 1, pageSize);
      setCars(response.carInfoGetDtos || []);
      setPagination({
        current: (response.pageNo || 0) + 1,
        pageSize: response.pageSize || pageSize,
        total: response.totalElements || 0,
      });
    } catch (error) {
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách xe.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  const handleTableChange = (newPagination) => {
    loadCars(newPagination.current, newPagination.pageSize);
  };

  const handleView = async (id) => {
    try {
      const car = await getCarDetails(id);
      setSelectedCar(car);
      setModalType("view");
      setModalVisible(true);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể tải thông tin chi tiết xe.",
      });
    }
  };

  const handleEdit = async (id) => {
    try {
      const car = await getCarDetails(id);
      setSelectedCar(car);
      // map nested fields into form
      form.setFieldsValue({
        carName: car.carName,
        categoryId: car.category?.id,
        price: car.price,
        driveType: car.driveType,
        year: car.year,
        // color
        colorName: car.color?.colorName,
        colorHex: car.color?.colorHexCode,
        extraCost: 0,
        // dimension
        seatNumber: car.dimension?.seatNumber,
        weightLbs: car.dimension?.weightLbs,
        groundClearanceIn: car.dimension?.groundClearanceIn,
        widthFoldedIn: car.dimension?.widthFoldedIn,
        widthExtendedIn: car.dimension?.widthExtendedIn,
        lengthMm: car.dimension?.lengthMm,
        heightIn: car.dimension?.heightIn,
        lengthIn: car.dimension?.lengthIn,
        wheelsSizeCm: car.dimension?.wheelsSizeCm,
        // performance
        batteryId: car.performanceDetailGetDto?.battery?.id,
        motorId: car.performanceDetailGetDto?.motor?.motorId,
        rangeMiles: car.performanceDetailGetDto?.rangeMiles,
        accelerationSec: car.performanceDetailGetDto?.accelerationSec,
        topSpeedMph: car.performanceDetailGetDto?.topSpeedMph,
        towingLbs: car.performanceDetailGetDto?.towingLbs,
      });
      setModalType("edit");
      setModalVisible(true);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể tải thông tin xe để chỉnh sửa.",
      });
    }
  };

  const handleCreate = () => {
    form.resetFields();
    setSelectedCar(null);
    setModalType("create");
    setModalVisible(true);
  };

  // NOTE: create no longer handles images. images are added via row "Ảnh" action.
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (modalType === "create") {
        const createData = {
          carModelId: Number(values.carModelId),
          carName: values.carName,
          carStatus: values.carStatus,
          color: values.color,

          dimensionPostDto: {
            seatNumber: Number(values.seatNumber),
            weightLbs: Number(values.weightLbs),
            groundClearanceIn: Number(values.groundClearanceIn),
            widthFoldedIn: Number(values.widthFoldedIn),
            widthExtendedIn: Number(values.widthExtendedIn),
            lengthMm: Number(values.lengthMm),
            heightIn: Number(values.heightIn),
            lengthIn: Number(values.lengthIn),
            wheelsSizeCm: Number(values.wheelsSizeCm),
          },

          performancePostDto: {
            batteryType: values.batteryType,
            motorType: values.motorType,
            rangeMiles: Number(values.rangeMiles),
            accelerationSec: Number(values.accelerationSec),
            topSpeedMph: Number(values.topSpeedMph),
            towingLbs: Number(values.towingLbs),
          },
        };

        await createCar(createData);
        notification.success({
          message: "Tạo mới thành công!",
          description: "Chào mừng bạn đến với hệ thống EVD.",
          placement: "topRight",
        });
      } else if (modalType === "edit") {
        const updateData = {
          categoryName: values.categoryName,
          carName: values.carName,
          price: Number(values.price || 0),
          driveType: values.driveType,
          year: Number(values.year || 0),
        };
        await updateCar(selectedCar.id, updateData);
        notification.success({
          message: "Cập nhật thành công!",
          description: "Chào mừng bạn đến với hệ thống EVD.",
          placement: "topRight",
        });
      }
      setModalVisible(false);
      form.resetFields();
      // refetch list after create/update
      await loadCars(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi lưu thông tin.",
      });
    }
  };

  // Upload images for an existing car (triggered from table row)
  const openUploadModal = (record) => {
    setUploadTargetCar(record);
    setUploadFileList([]);
    setUploadModalVisible(true);
  };

  const uploadBefore = (file) => {
    setUploadFileList((prev) => [
      ...prev,
      {
        uid: file.uid,
        name: file.name,
        status: "ready",
        originFileObj: file,
      },
    ]);
    return false; // prevent auto upload
  };

  const handleRemoveUploadFile = (file) => {
    setUploadFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  const handleUploadSubmit = async () => {
    if (!uploadTargetCar) return;
    if (!uploadFileList.length) {
      notification.warn({ message: "Vui lòng chọn tệp để tải lên." });
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();

      uploadFileList.forEach((f) => {
        if (f.originFileObj) {
          fd.append("files", f.originFileObj); // <-- phải là "files"
        }
      });

      await postImageForCar(
        uploadTargetCar.carId,
        uploadFileList.map((x) => x.originFileObj)
      );

      notification.success({ message: "Tải ảnh thành công" });
      setUploadModalVisible(false);
      setUploadTargetCar(null);
      setUploadFileList([]);
      await loadCars(pagination.current, pagination.pageSize);
    } catch (err) {
      console.error(err);
      notification.error({ message: "Tải ảnh thất bại" });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Tên xe", dataIndex: "carName", key: "carName" },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(price || 0),
    },
    {
      title: "Hình ảnh",
      dataIndex: "carImages",
      key: "carImages",
      render: (images) =>
        images?.[0]?.fileUrl ? (
          <img
            src={images[0].fileUrl}
            alt="Car"
            style={{
              width: 120,
              height: 100,
              objectFit: "cover",
              borderRadius: 6,
            }}
          />
        ) : (
          <div
            style={{
              width: 120,
              height: 100,
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
            }}
          >
            No image
          </div>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleView(record.carId)}
          >
            Xem
          </Button>
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={() => handleEdit(record.carId)}
          >
            Sửa
          </Button>
          <Button
            icon={<UploadOutlined />}
            onClick={() => openUploadModal(record)}
          >
            Ảnh
          </Button>
        </Space>
      ),
    },
  ];

  const renderCreateForm = () => (
    <Form form={form} layout="vertical">
      <Tabs defaultActiveKey="1">
        <TabPane tab="Thông tin cơ bản" key="1">
          <Form.Item
            name="carModelId"
            label="Car Model ID"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="carName" label="Tên xe" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="carStatus"
            label="Trạng thái xe"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "FOR_SALE", value: "FOR_SALE" },
                { label: "SOLD", value: "SOLD" },
                { label: "MAINTENANCE", value: "MAINTENANCE" },
              ]}
            />
          </Form.Item>

          <Form.Item name="color" label="Màu xe" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </TabPane>

        {/* <TabPane tab="Màu sắc" key="2">
          <Form.Item
            name="colorName"
            label="Tên màu"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="colorHex"
            label="Mã màu (hex)"
            rules={[{ required: true }]}
          >
            <Input type="color" />
          </Form.Item>
          <Form.Item name="extraCost" label="Phụ phí">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </TabPane> */}

        <TabPane tab="Kích thước" key="3">
          <Form.Item name="seatNumber" label="Số ghế">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="weightLbs" label="Trọng lượng (lbs)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="groundClearanceIn" label="Khoảng sáng gầm (in)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="widthFoldedIn" label="Chiều rộng khi gập (in)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="widthExtendedIn" label="Chiều rộng khi mở (in)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="lengthMm" label="Chiều dài (mm)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="heightIn" label="Chiều cao (in)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="lengthIn" label="Chiều dài (in)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="wheelsSizeCm" label="Kích thước mâm (cm)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </TabPane>

        <TabPane tab="Hiệu suất" key="4">
          <Form.Item
            name="batteryType"
            label="Loại Pin"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "STANDARD", value: "STANDARD" },
                { label: "LITHIUM", value: "LITHIUM" },
                { label: "PREMIUM", value: "PREMIUM" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="motorType"
            label="Loại động cơ"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "DC_BRUSHED", value: "DC_BRUSHED" },
                { label: "DC_BRUSHLESS", value: "DC_BRUSHLESS" },
                { label: "AC", value: "AC" },
              ]}
            />
          </Form.Item>

          <Form.Item name="rangeMiles" label="Phạm vi (miles)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="accelerationSec" label="Tăng tốc (sec)">
            <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="topSpeedMph" label="Tốc độ tối đa (mph)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="towingLbs" label="Sức kéo (lbs)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </TabPane>
      </Tabs>
    </Form>
  );

  const renderDetailView = () => {
    if (!selectedCar) return null;
    const car = selectedCar;
    return (
      <>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="ID">{car.carDetailId}</Descriptions.Item>
          <Descriptions.Item label="Tên xe">{car.carName}</Descriptions.Item>
          {/* <Descriptions.Item label="Loại dẫn động">
            {car.driveType}
          </Descriptions.Item> */}
          {/* <Descriptions.Item label="Năm">{car.year}</Descriptions.Item> */}
          <Descriptions.Item label="Dòng xe">
            {/* {car.category?.categoryName} (ID: {car.category?.id}) */}
            {car.carModelName}
          </Descriptions.Item>

          <Descriptions.Item label="Kích thước">
            <div>
              Số ghế: {car.dimension?.seatNumber ?? "-"}
              <br />
              Trọng lượng (lbs): {car.dimension?.weightLbs ?? "-"}
              <br />
              Khoảng sáng gầm (in): {car.dimension?.groundClearanceIn ?? "-"}
              <br />
              Width folded (in): {car.dimension?.widthFoldedIn ?? "-"}
              <br />
              Width extended (in): {car.dimension?.widthExtendedIn ?? "-"}
              <br />
              Length (mm): {car.dimension?.lengthMm ?? "-"}
              <br />
              Height (in): {car.dimension?.heightIn ?? "-"}
              <br />
              Length (in): {car.dimension?.lengthIn ?? "-"}
              <br />
              Wheels size (cm): {car.dimension?.wheelsSizeCm ?? "-"}
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Màu sắc">
            {/* {car.color ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 24,
                    background:
                      car.color.colorHexCode ||
                      car.color.colorHexCode ||
                      "#fff",
                    border: "1px solid #ddd",
                  }}
                />
                <div>
                  {car.color.colorName} (Hex: {car.color.colorHexCode || "-"})
                </div>
              </div>
            ) : (
              "-"
            )} */}
            {car.color || "-"}
          </Descriptions.Item>

          <Descriptions.Item label="Hiệu suất">
            <div>
              Phạm vi (miles): {car.performanceDetailGetDto?.rangeMiles ?? "-"}
              <br />
              Tăng tốc (sec):{" "}
              {car.performanceDetailGetDto?.accelerationSec ?? "-"}
              <br />
              Tốc độ tối đa (mph):{" "}
              {car.performanceDetailGetDto?.topSpeedMph ?? "-"}
              <br />
              Sức kéo (lbs): {car.performanceDetailGetDto?.towingLbs ?? "-"}
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Chi tiết Pin">
            {car.performanceDetailGetDto?.battery ? (
              <div>
                ID: {car.performanceDetailGetDto.battery.id}
                <br />
                Loại: {car.performanceDetailGetDto.battery.chemistryType}
                <br />
                Trọng lượng (kg): {car.performanceDetailGetDto.battery.weightKg}
                <br />
                Công suất (kWh):{" "}
                {car.performanceDetailGetDto.battery.capacityKwh}
                <br />
                Charge time / Age / Cycle life:{" "}
                {car.performanceDetailGetDto.battery.chargeTime} /{" "}
                {car.performanceDetailGetDto.battery.age} /{" "}
                {car.performanceDetailGetDto.battery.cycleLife}
              </div>
            ) : (
              "-"
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Chi tiết Động cơ">
            {car.performanceDetailGetDto?.motor ? (
              <div>
                Motor ID: {car.performanceDetailGetDto.motor.motorId}
                <br />
                Loại: {car.performanceDetailGetDto.motor.motorType}
                <br />
                Power (kW): {car.performanceDetailGetDto.motor.powerKw}
                <br />
                Torque (Nm): {car.performanceDetailGetDto.motor.torqueNm}
                <br />
                Cooling: {car.performanceDetailGetDto.motor.coolingType}
              </div>
            ) : (
              "-"
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Ảnh">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {car.carImages && car.carImages.length ? (
                car.carImages.map((img, idx) => (
                  <div key={idx} style={{ width: 160 }}>
                    <Image
                      src={img.fileUrl || img.filePath}
                      alt={img.fileName}
                      width={160}
                    />
                    <div style={{ fontSize: 12, marginTop: 6 }}>
                      {img.fileName}
                    </div>
                  </div>
                ))
              ) : (
                <div>Không có ảnh</div>
              )}
            </div>
          </Descriptions.Item>
        </Descriptions>
      </>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 py-8 px-4">
      <Card className="w-full mx-auto" title="Quản lý xe điện">
        <div className="mb-4">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Thêm xe mới
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={cars}
          rowKey="carId"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={
          modalType === "view"
            ? "Chi tiết xe"
            : modalType === "edit"
            ? "Chỉnh sửa xe"
            : "Thêm xe mới"
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={
          modalType !== "view" ? handleSubmit : () => setModalVisible(false)
        }
        okText={
          modalType === "view"
            ? "Trở lại"
            : modalType === "edit"
            ? "Cập nhật"
            : "Tạo mới"
        }
        cancelText="Hủy"
        width={900}
      >
        {modalType === "view" ? renderDetailView() : renderCreateForm()}
      </Modal>

      <Modal
        title={
          uploadTargetCar
            ? `Tải ảnh cho: ${uploadTargetCar.carName || uploadTargetCar.carId}`
            : "Tải ảnh"
        }
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onOk={handleUploadSubmit}
        okText="Tải lên"
      >
        <Upload
          beforeUpload={uploadBefore}
          onRemove={handleRemoveUploadFile}
          fileList={uploadFileList}
          listType="picture"
          multiple
        >
          <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
        </Upload>
      </Modal>
    </div>
  );
}
