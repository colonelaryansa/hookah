import { Button, Form, Input, Spin, Select, Row, Col, Space } from 'antd';
import { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useMapEvents } from 'react-leaflet/hooks'
import NotificationContext from '../../../Contexts/Notification';
import { getAllNeighbours } from '../../../Services/NeighbourService';
import ValidationRuleGenerator from '../../../Utils/ValidationRuleGenerator';
import { createLocation } from '../../../Services/LocationService';

export default function Create() {
    const [form] = Form.useForm();
    const [spinning, setSpinning] = useState(false)
    const [neighbours, setNeighbours] = useState([])
    const openNotification = useContext(NotificationContext)

    const [clickedPosition, setClickedPosition] = useState(null)
    function LocationMarker() {
        useMapEvents({
            click(e) {
                setClickedPosition(e.latlng)
                const formCoordinateValue = `${e.latlng.lat},${e.latlng.lng}`;
                form.setFieldValue('coordinate', formCoordinateValue)
            },
        })
        return clickedPosition === null ? null : (
            <Marker position={clickedPosition}>
                <Popup>You are here</Popup>
            </Marker>
        )
    }

    useEffect(() => {
        getAllNeighbours().then(data => setNeighbours(data))
    }, [])

    const onFinish = (values) => {
        setSpinning(true)
        values.neighbour = neighbours.find(n => n.title === values.neighbour_id).id
        createLocation(values)
            .then((response) => {
                setSpinning(false)
                form.resetFields();
                if (response.statusText === 'Created') {
                    openNotification('success', 'مکان با موفقیت ثبت شد')
                } else {
                    openNotification('error', 'خطا در ثبت اطلاعات')
                }
            })
            .catch(() => {
                setSpinning(false)
                form.resetFields();
                openNotification('error', 'سرور خطا دارد 💩')
            })
    };
    const onFinishFailed = () => {
        openNotification('error', 'مقادیر فرم را بصورت صحیح وارد کنید')
    };

    const availableDistricts = [...new Set(neighbours.map(neighbour => neighbour.district).sort())]
    const selectOptionGroupValue = availableDistricts.map((district) => {
        const districtNeighbours = neighbours.filter((neighbour) => neighbour.district === district)
        return {
            label: <span>منطقه {district}</span>,
            title: `منطقه ${district}`,
            options: districtNeighbours.map((neighbour) => ({ label: neighbour.title, value: neighbour.title }))
        }
    })
    const removeMarker = () => {
        setClickedPosition(null)
    }
    return (
        <>
            <Row>
                <Col span={24}>
                    <Form
                        colon={false}
                        form={form}
                        name="basic"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        labelCol={{ span: 1 }}
                        wrapperCol={{ span: 10 }}
                        requiredMark={false}
                    >
                        <p>نقشه</p>
                        <div style={{ marginBottom: 30, width: "100%", height: "25rem" }}>
                            <MapContainer
                                center={[35.746, 51.303]}
                                zoom={16}
                                scrollWheelZoom={false}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationMarker />
                            </MapContainer>
                        </div>
                        <Form.Item
                            label="عنوان"
                            name="title"
                            hasFeedback
                            validateFirst
                            // validateDebounce={1000}
                            rules={
                                ValidationRuleGenerator({
                                    label: "عنوان",
                                    max: 100,
                                    patternType: "persianLetter"
                                })
                            }
                        >
                            <Input
                                showCount
                                maxLength={100}
                            />
                        </Form.Item>
                        <Form.Item
                            label="محله"
                            name="neighbour_id"
                            hasFeedback
                            validateFirst
                            rules={[
                                {
                                    required: true,
                                    message: 'وارد کردن محله الزامی است',
                                },
                            ]}
                        >
                            <Select showSearch options={selectOptionGroupValue} />
                        </Form.Item>
                        <Form.Item
                            label="تلفن"
                            name="telephone"
                            hasFeedback
                            validateFirst
                            rules={
                                ValidationRuleGenerator({
                                    label: "عنوان",
                                    max: 100,
                                    min: 8,
                                    patternType: "digit"
                                })
                            }
                        >
                            <Input
                                showCount
                                maxLength={20}
                            />
                        </Form.Item>
                        <Form.Item
                            label="نشانی"
                            name="address"
                            hasFeedback
                            validateFirst
                            rules={
                                ValidationRuleGenerator({
                                    label: "نشانی",
                                    max: 100,
                                    min: 5,
                                    patternType: "persianLetter"
                                })
                            }
                        >
                            <Input.TextArea
                                showCount
                                maxLength={255}
                            />
                        </Form.Item>
                        <Form.Item

                            label="مختصات"
                            name="coordinate"
                            hasFeedback
                            validateFirst
                            rules={[
                                {
                                    required: true,
                                    message: 'انتخاب روی نقشه الزامی است',
                                },
                                {
                                    max: 50,
                                },
                            ]}
                        >
                            <Input
                                disabled={false}
                                showCount
                                maxLength={50}
                                placeholder='روی نقشه انتخاب کنید'
                            />
                        </Form.Item>
                        <Form.Item
                            wrapperCol={{
                                offset: 1,
                                span: 24,
                            }}
                        >
                            <Space>
                                {/* <SubmitButton form={form}>ثبت</SubmitButton> */}
                                <Button type='primary' htmlType='submit'>
                                    ثبت
                                </Button>
                                <Button type="primary" danger htmlType="reset" onClick={removeMarker}>
                                    بازنشانی
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form >
                </Col>
            </Row>
            <Spin spinning={spinning} fullscreen />
        </>
    )
}
