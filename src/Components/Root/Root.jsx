import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Layout, ConfigProvider, theme, Menu, notification } from 'antd';
import faIR from 'antd/locale/fa_IR'
import NotificationContext from '../../Contexts/Notification'
import { FaEarthAmericas, FaList, FaCity, FaSquarePlus, FaHouse } from "react-icons/fa6";


const { Content, Footer } = Layout;

export default function Root() {
  const [current, setCurrent] = useState((useLocation().pathname));
  const [api, notificationContextHolder] = notification.useNotification();

  let location = useLocation();

  useEffect(() => setCurrent(location.pathname), [location]);


  const openNotification = (type, message) => {
    api[type]({
      message: message,
      placement: 'top',
      rtl: true
    });
  };

  const items = [
    {
      key: '/',
      icon: <FaHouse />,
      label: (
        <Link to="/">خانه</Link>
      ),
    },
    {
      key: '/explore',
      icon: <FaEarthAmericas />,
      label: (
        <Link to="/explore">نقشه</Link>
      ),
    },
    {
      key: '/list',
      icon: <FaList />,
      label: (
        <Link to="/list">فهرست</Link>
      ),
    },
    {
      key: '/neighbour',
      icon: <FaCity />,
      label: (
        <Link to="/neighbour">محله</Link>
      ),
    },
    {
      key: '/location/create',
      icon: <FaSquarePlus />,
      label: (
        <Link to="/location/create">ایجاد مکان</Link>
      ),
    },
  ];

  const onClick = (e) => {
    setCurrent(e.key);
  };
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <ConfigProvider
      locale={faIR}
      direction="rtl"
      theme={
        {
          components: {
            Dropdown: {
              paddingBlock: 12
            }
          },
          token: { colorPrimary: '#00b96b' }
        }
      }>
      <NotificationContext.Provider value={openNotification}>
        {notificationContextHolder}
        <Layout>
          <div style={{ marginBottom: 25 }}>
            <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
          </div>
          <Content style={{ padding: '0 48px' }}>
            <div
              style={{
                background: colorBgContainer,
                padding: 25,
                borderRadius: borderRadiusLG,
              }}
            >
              <Outlet />
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Created by Aryan Sa
          </Footer>
        </Layout>
      </NotificationContext.Provider>
    </ConfigProvider >
  );
}
