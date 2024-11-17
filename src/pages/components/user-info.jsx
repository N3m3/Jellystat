import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../../lib/axios_instance";
import AccountCircleFillIcon from "remixicon-react/AccountCircleFillIcon";
import Config from "../../lib/config";
import { Tabs, Tab, Button, ButtonGroup } from "react-bootstrap";

import LastPlayed from "./user-info/lastplayed";
import UserActivity from "./user-info/user-activity";
import "../css/users/user-details.css";
import { Trans } from "react-i18next";
import baseUrl from "../../lib/baseurl";
import GlobalStats from "./general/globalStats";

function UserInfo() {
  const { UserId } = useParams();
  const [data, setData] = useState();
  const [imgError, setImgError] = useState(false);
  const [config, setConfig] = useState();
  const [activeTab, setActiveTab] = useState("tabOverview");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const newConfig = await Config.getConfig();
        setConfig(newConfig);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchData = async () => {
      if (config) {
        try {
          const userData = await axios.post(
            `/api/getUserDetails`,
            {
              userid: UserId,
            },
            {
              headers: {
                Authorization: `Bearer ${config.token}`,
                "Content-Type": "application/json",
              },
            }
          );
          setData(userData.data);
        } catch (error) {
          console.log(error);
        }
      }
    };
    fetchData();

    if (!config) {
      fetchConfig();
    }

    const intervalId = setInterval(fetchData, 60000 * 5);
    return () => clearInterval(intervalId);
  }, [config, UserId]);

  const handleImageError = () => {
    setImgError(true);
  };

  if (!data || !config) {
    return <></>;
  }

  return (
    <div>
      <div className="user-detail-container">
        <div className="user-image-container">
          {imgError ? (
            <AccountCircleFillIcon size={"100%"} />
          ) : (
            <img
              className="user-image"
              src={baseUrl + "/proxy/Users/Images/Primary?id=" + UserId + "&quality=100"}
              onError={handleImageError}
              alt=""
            ></img>
          )}
        </div>

        <div>
          <p className="user-name">{data.Name}</p>
          <ButtonGroup>
            <Button
              onClick={() => setActiveTab("tabOverview")}
              active={activeTab === "tabOverview"}
              variant="outline-primary"
              type="button"
            >
              <Trans i18nKey="TAB_CONTROLS.OVERVIEW" />
            </Button>
            <Button
              onClick={() => setActiveTab("tabActivity")}
              active={activeTab === "tabActivity"}
              variant="outline-primary"
              type="button"
            >
              <Trans i18nKey="TAB_CONTROLS.ACTIVITY" />
            </Button>
          </ButtonGroup>
        </div>
      </div>

      <Tabs defaultActiveKey="tabOverview" activeKey={activeTab} variant="pills">
        <Tab eventKey="tabOverview" className="bg-transparent">
          <GlobalStats
            id={UserId}
            param={"userid"}
            endpoint={"getGlobalUserStats"}
            title={<Trans i18nKey="USERS_PAGE.USER_STATS" />}
          />
          <LastPlayed UserId={UserId} />
        </Tab>
        <Tab eventKey="tabActivity" className="bg-transparent">
          <UserActivity UserId={UserId} />
        </Tab>
      </Tabs>
    </div>
  );
}
export default UserInfo;
