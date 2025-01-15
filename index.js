import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const LivePreview = () => {
   const [selectedDevice, setSelectedDevice] = useState("Device-1");
  const [isLive, setIsLive] = useState(false);
  const [videoData, setVideoData] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  //  console.log(videoData[currentVideoIndex])
  // Function to check if the device is live
  console.log(selectedDevice)
  const checkDeviceLiveStatus = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/check-live?divisename=${selectedDevice}`);
      if (response.data.isLive) {
        setIsLive(true);
        fetchVideos(); // Fetch initial videos if live
      } else {
        setError("Device is not live.");
        setIsLive(false);
      }
    } catch (err) {
      setError("Error checking live status");
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch video data
  const fetchVideos = async () => {
    const formattedDate = new Date()
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");
    const fromTime = "01:00:00"; // Start of the day
    const toTime = "23:59:59"; // End of the day
    // const deviceName = "Device-1";

    try {
      const response = await axios.get(
        `https://test2sever.onrender.com/find?fromdate=${formattedDate}&todate=${formattedDate}&fromtime=${fromTime}&totime=${toTime}&divisename=${selectedDevice}`
      );

      if (response.data && response.data.length > 0) {
        const sortedData = response.data.sort((a, b) => {
          const timeA = new Date(`1970-01-01T${a.fromtime}Z`).getTime();
          const timeB = new Date(`1970-01-01T${b.fromtime}Z`).getTime();
          return timeA - timeB; // Sort by fromtime
        });
        setVideoData(sortedData);
        setCurrentVideoIndex(sortedData.length - 1); // Start with the last video
        videoRef.current.play();
      } else {
        setError("No videos found for the selected date.");
      }
    } catch (err) {
      setError("Error fetching videos");
    }
  };

  // Function to handle video end event
  const handleVideoEnd = () => {
    if (currentVideoIndex < videoData.length - 1) {
      setCurrentVideoIndex((prevIndex) => prevIndex + 1); // Play next video
    } else {
      setCurrentVideoIndex(videoData.length - 1); // Reset to the first video or handle as needed
    }
  };
  const togglePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
      // sendStopSignal()
    } else {
      sendSignal();
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  // Function to send stop signal via curl request
  const sendSignal = () => {
    setInterval(() => {
      fetch("http://localhost:3000/signal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "start",
        }),
      })
        .then((response) => response.json())
        .then((data) => console.log("Stop signal sent"))
        .catch((error) => console.error("Error sending stop signal:", error));
    }, 10000); // Interval of 1.5 seconds
  };

  const sendStopSignal = () => {
    // setInterval(() => {
    fetch("http://localhost:3000/signal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "stop",
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log("Stop signal sent"))
      .catch((error) => console.error("Error sending stop signal:", error));
    // }, 1500); // Interval of 1.5 seconds
  };

  // Function to fetch latest videos every 30 seconds
  const fetchVideosPeriodically = () => {
    setInterval(() => {
      fetchVideos(); // Fetch new video data every 30 seconds
    }, 30000); // 30-second interval
  };
  // useEffect(()=>{
  //   sendSignal()
  // },[])
  // Auto-play the current video whenever it changes
  useEffect(() => {
    if (videoData.length > 0 && currentVideoIndex >= 0) {
      const currentVideo = videoData[currentVideoIndex];
      if (videoRef.current && currentVideo) {
        videoRef.current.src = currentVideo.url;
        videoRef.current.play();
      }
    }
  }, [videoData, currentVideoIndex]);

  // Initial check for device live status when the component mounts
  useEffect(() => {
    checkDeviceLiveStatus();
    const interval = setInterval(() => {
      if (isLive) {
        fetchVideos(); // Refresh videos every 5 minutes
      }
    }, 300000); // 5-minute interval

    fetchVideosPeriodically(); // Start periodic fetching of new video data every 30 seconds

    return () => {
      clearInterval(interval); // Cleanup interval on unmount
    };
  }, [isLive,selectedDevice]);

  if (loading) return <p>Loading...</p>;
  // if (error) return  <p>{error}</p>;

  return (
    <div>
      {isLive ? (
        <div>
          <h3>Playing Live Video</h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              // controls
              onEnded={handleVideoEnd}
              style={{ width: "640px", height: "360px" }}
              preload="auto"
            />
            <br />
            <button
              onClick={togglePlayPause}
              style={{
                marginTop: "10px",
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              {isPlaying ? "Stop Live" : "Go Live"}
            </button>{" "}
            <p>Currently Playing: {videoData[currentVideoIndex]?.filename}</p>
            <div style={styles.controlItem}>
            <label style={styles.label} htmlFor="deviceSelect">
              Select Device:
            </label>
            <select
              id="deviceSelect"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              style={styles.select}
            >
              {/* <option value="Device-1">Device 1</option> */}
              <option value="Device-1">Device 1</option>
              <option value="Device-2">Device 2</option>
              <option value="Device-3">Device 3</option>
              <option value="Device-4">Device 4</option>
              <option value="Device-5">Device 5</option>
            </select>
          </div>
          </div>
        </div>
      ) : (
        <>
          <p>Device is not live. Please check the device status.</p>
          <div style={styles.controlItem}>
            <label style={styles.label} htmlFor="deviceSelect">
              Select Device:
            </label>
            <select
              id="deviceSelect"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              style={styles.select}
            >
              {/* <option value="Device-1">Device 1</option> */}
              <option value="Device-1">Device 1</option>
              <option value="Device-2">Device 2</option>
              <option value="Device-3">Device 3</option>
              <option value="Device-4">Device 4</option>
              <option value="Device-5">Device 5</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    gap: "20px",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "20px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  videoContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "20px",
    alignItems: "flex-start",
    width: "100%",
    maxWidth: "800px",
  },
  video: {
    flex: 1,
    border: "1px solid #ccc",
    borderRadius: "5px",
    backgroundColor: "#000",
  },
  controls: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    margin: "50px 80px",
  },
  controlItem: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    width: "200px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
  },
  select: {
    padding: "8px",
    fontSize: "14px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  input: {
    padding: "8px",
    fontSize: "14px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  filterButton: {
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  error: {
    color: "red",
    fontSize: "12px",
  },
};

export default LivePreview;
