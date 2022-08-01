import React, { useState, useEffect } from "react";
import {
  FieldLabel,
  TextInput,
  InstructionText,
} from "@contentstack/venus-components";
import ContentstackAppSdk from "@contentstack/app-sdk";
import debounce from "lodash/debounce";

import "@contentstack/venus-components/build/main.css";
import "./configApp.css";

const mergeObjects = (target, source) => {
  Object.keys(source)?.forEach((key) => {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], mergeObjects(target[key], source[key]));
    }
  });
  Object.assign(target || {}, source);
  return target;
};

const inputFieldName = "appUrl";

const ConfigScreen = function () {
  const [state, setState] = useState({
    installationData: {
      configuration: {
        /* Add all your config fields here */
        /* The key defined here should match with the name attribute
        given in the DOM that is being returned at last in this component */
        [inputFieldName]: "",
      },
      serverConfiguration: {},
    },
    setInstallationData: () => {},
    appSdkInitialized: false,
  });

  const [fieldValue, setValue] = useState("");
  const [errStatus, setErrStatus] = useState(false);

  useEffect(() => {
    ContentstackAppSdk.init()
      .then(async (appSdk) => {
        console.log("ConfigScreen -> appSdk", appSdk)
        const sdkConfigData = appSdk?.location?.AppConfigWidget?.installation;
        if (sdkConfigData) {
          const installationDataFromSDK =
            await sdkConfigData.getInstallationData();
          const setInstallationDataOfSDK = sdkConfigData.setInstallationData;

          setState({
            ...state,
            installationData: mergeObjects(
              state.installationData,
              installationDataFromSDK
            ),
            setInstallationData: setInstallationDataOfSDK,
            appSdkInitialized: true,
          });
        } else {
          console.log("ContentstackAppSdk init sdkConfigData not found");
          setErrStatus(true)
        }
      })
      .catch((error) => {
        setErrStatus(true)
        console.log("ContentstackAppSdk init error", error);
      });
  }, []);



  const updateConfig = async (fieldValue) => {
    try {
      console.log("ConfigScreen -> fieldValue", fieldValue);
      const updatedConfig = state?.installationData?.configuration || {};
      updatedConfig[inputFieldName] = fieldValue;

      const updatedServerConfig = state.installationData.serverConfiguration;
      updatedServerConfig[inputFieldName] = fieldValue;

      if (state.setInstallationData ) {
        const updatedStateObject = {
          ...state.installationData,
          configuration: updatedConfig,
          serverConfiguration: updatedServerConfig,
        }
        console.log('state.setInstallationData found setting up', updatedStateObject)
        await state.setInstallationData(updatedStateObject);
      }
    } catch (error) {
      setErrStatus(true)
      console.log("updateConfig -> error", error);
    }
  }
  
  const handleOnchange = (e) => {
    let { value } = e.target;
    setValue(value);
    // debounceUpdate();
    updateConfig(value)
  };

  // const debounceUpdate = debounce(() => {
  //   updateConfig()
  // }, 500)


  return (
    <div className="layout-container">

        <div style={{display: 'flex', padding: '20px 8px'}}>
          <p className="configHeading">Release Preview Config</p>
          <hr className="hr-line"/>
        </div>
      <div className="config-wrapper">
        <FieldLabel required htmlFor="configField1Id">
          {" "}
          {"App URL"}
        </FieldLabel>
        {/* <span style={{color: '#d62400', fontWeight: 500}}>Invalid App URL</span> */}
        <TextInput
          id="configField1Id"
          required
          value={fieldValue}
          placeholder={"Enter app URL"}
          /* The name attribute given here should match with the
            state variable definition. Please check the comments above
            at the state variable definition. */
          name={inputFieldName}
          onChange={handleOnchange}
        />
        {/* <InstructionText>
          {localeTexts.configFields.field1.instruction}
        </InstructionText> */}
      </div>
    </div>
  );
};

export default ConfigScreen;
