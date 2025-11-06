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
          categoryId: Number(values.categoryId),
          colorPostDto: {
            colorName: values.colorName || "",
            colorHex: values.colorHex || "",
            extraCost: Number(values.extraCost || 0),
          },
          carName: values.carName,
          price: Number(values.price || 0),
          driveType: values.driveType,
          year: Number(values.year || 0),
          dimensionPostDto: {
            seatNumber: Number(values.seatNumber || 0),
            weightLbs: Number(values.weightLbs || 0),
            groundClearanceIn: Number(values.groundClearanceIn || 0),
            widthFoldedIn: Number(values.widthFoldedIn || 0),
            widthExtendedIn: Number(values.widthExtendedIn || 0),
            lengthMm: Number(values.lengthMm || 0),
            heightIn: Number(values.heightIn || 0),
            lengthIn: Number(values.lengthIn || 0),
            wheelsSizeCm: Number(values.wheelsSizeCm || 0),
          },
          performancePostDto: {
            batteryId: Number(values.batteryId || 0),
            motorId: Number(values.motorId || 0),
            rangeMiles: Number(values.rangeMiles || 0),
            accelerationSec: Number(values.accelerationSec || 0),
            topSpeedMph: Number(values.topSpeedMph || 0),
            towingLbs: Number(values.towingLbs || 0),
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
          <Form.Item name="carName" label="Tên xe" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="Danh mục (ID)"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
            <InputNumber
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="driveType"
            label="Loại dẫn động"
            rules={[{ required: true }]}
          >
            <Select options={driveTypeOptions} />
          </Form.Item>
          <Form.Item
            name="year"
            label="Năm sản xuất"
            rules={[{ required: true }]}
          >
            <InputNumber min={1900} max={2100} style={{ width: "100%" }} />
          </Form.Item>
        </TabPane>

        <TabPane tab="Màu sắc" key="2">
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

          {/* Upload removed from create form per request.
              Images are added later via the "Ảnh" action in the list. */}
        </TabPane>

        <TabPane tab="Kích thước" key="3">
          <Form.Item name="seatNumber" label="Số ghế">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="weightLbs" label="Trọng lượng (lbs)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="groundClearanceIn" label="Khoảng sáng gầm (in)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="widthFoldedIn" label="Chiều rộng khi gập gương (in)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="widthExtendedIn"
            label="Chiều rộng khi mở gương (in)"
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="lengthMm" label="Chiều dài xe (mm)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="heightIn" label="Chiều cao xe (in)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="lengthIn" label="Chiều dài xe (in)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="wheelsSizeCm" label="Kích thước mâm/lốp (cm)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </TabPane>

        <TabPane tab="Hiệu suất" key="4">
          <Form.Item name="batteryId" label="ID Pin">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="motorId" label="ID Động cơ">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="rangeMiles" label="Phạm vi (miles)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="accelerationSec" label="Tăng tốc (sec)">
            <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
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
          <Descriptions.Item label="ID">{car.id}</Descriptions.Item>
          <Descriptions.Item label="Tên xe">{car.carName}</Descriptions.Item>
          <Descriptions.Item label="Loại dẫn động">
            {car.driveType}
          </Descriptions.Item>
          <Descriptions.Item label="Năm">{car.year}</Descriptions.Item>
          <Descriptions.Item label="Danh mục">
            {car.category?.categoryName} (ID: {car.category?.id})
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
            {car.color ? (
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
            )}
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
