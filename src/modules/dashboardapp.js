import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Select } from '@contentstack/venus-components';
import ContentstackAppSDK from "@contentstack/app-sdk";


import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import listPlugin from '@fullcalendar/list';

import moment from 'moment';

// import the third-party stylesheets directly from your JS
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // needs additional webpack config!

import { Calendar } from '@fullcalendar/core';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';

const DashboardApp = () => {

  // const [configUrl, setConfigUrl] = useState('https://spar-osterreich-preview.contentstackdemos.com');
  const [configUrl, setConfigUrl] = useState('https://spar-osterreich.contentstackdemos.com/integration');
  const [releaseList, setRelease] = useState([]);

  useEffect(() => {

    ContentstackAppSDK.init().then(async (sdk) => {
      const extension = sdk.location.DashboardWidget;
      const config = await sdk.getConfig()
      setConfigUrl(config.appUrl);
    })

    var config = {
      method: 'get',
      url: 'https://eu-api.contentstack.com/v3/releases',
      headers: {
        'api_key': 'bltf3fef224f38d5f32',
        'authorization': 'cse4b5b7d297ed46e8c371861e',
        'Content-Type': 'application/json'
      },
    };

    axios(config)
      .then(function (response) {
        let releaseEvents = [];
        response.data.releases.map((release, index) => {

          let scheduled_at = release.status[0].scheduled_at

          releaseEvents.push({
            title: release.name,
            allDay: true,
            start: moment(scheduled_at).format('YYYY-MM-DD'),
            end: moment(scheduled_at).endOf('day'),
            url: `${configUrl}/?release_preview_id=${release.uid}`
          })
        })
        setRelease(releaseEvents);
      })
      .catch(function (error) {
        console.error(error);
      });


  }, [])

  const eventClick = (info) => {
    info.jsEvent.preventDefault();
    if (info.event.url) {
      console.log(info.event.url)
      window.open(info.event.url);
    }
  }

  return (
    <div className='releasepreview'>
      <div className='search'>
        <Select options={releaseList.map((rels, index) => ({
          label: rels.title,
          value: rels.url
        }))} isSearchable={true} placeholder="Search..." onChange={(data) => {
          if (data.value) {
            window.open(data.value);
          }
        }} selectLabel="Scheduled Releases" value={null} width="250px" />
        <ul>
          {releaseList.map((release, index) => (
            <li key={index}><a href={release.url} target="_blank">
              <svg width="30" height="30" viewBox="0 0 45 40" fill="none" class="Releases__icon Icon--original" name="Releases"><path d="M11.704 19L20 9.519 28.296 19H25.5a2 2 0 00-2 2v4h-7v-4a2 2 0 00-2-2h-2.796zM16.5 30h7v1h-7v-1z" stroke="#647696" stroke-width="2"></path></svg>
                <span>{release.title}</span>
              </a></li>
          ))}
        </ul>
      </div>
      <div className='calendar'>
        <FullCalendar
          plugins={[dayGridPlugin, listPlugin, bootstrap5Plugin]}
          initialView="dayGridMonth"
          events={releaseList}
          eventClick={eventClick}
          headerToolbar={{
            left: 'title',
            center: '',
            right: 'today dayGridMonth,dayGridWeek,list prev,next'
          }}
          themeSystem="bootstrap5"
        />
      </div>
    </div>
  )
}

export default DashboardApp;