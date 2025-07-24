import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import {
  ControlBar,
  ForwardControl,
  Player,
  ReplayControl,
  FullscreenToggle,
  VolumeMenuButton,
  LoadingSpinner,
} from 'video-react';

import CurrentTimeDisplay from './CurrentTimeDisplay';
import ProgressControl from './ProgressControl';
import PlayToggle from './PlayToggle';
import BigPlayButton from './BigPlayButton';

import { loadingText } from './styles';

const VideoPlayer = ({
  src,
  seekTo,
  playNext,
  onEnded,
  onSeeked,
  onSeeking,
  completed,
  reset,
  startTime,
  endTime,
  duration,
  monitorDetails,
  updateParentProps,
}) => {
  const playerRef = useRef(null);
  const [showLoadingText, setShowLoadingText] = useState(false);
  const prevStateRef = useRef({});
  const prevPropsRef = useRef({ seekTo, monitorDetails });

  // Handle state change callback
  const handleStateChange = (state) => {
    const prevState = prevStateRef.current;

    // Trigger onEnded callback only when video just ended
    if (onEnded && !prevState?.ended && state.ended) {
      onEnded();
      if (completed && playerRef.current) {
        playerRef.current.pause();
      }
    }

    // Show/hide loading text
    if (state.seeking === true || state.waiting === true) {
      setShowLoadingText(true);
    } else {
      setShowLoadingText(false);
    }

    prevStateRef.current = state;
  };

  const handleSeek = () => {
    if (onSeeked) onSeeked();
  };

  const handleSeeking = () => {
    if (onSeeking) onSeeking();
  };

  // Subscribe to state changes once
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.subscribeToStateChange(handleStateChange);
    }
  }, []);

  // Handle updates to seekTo and monitorDetails (replaces UNSAFE_componentWillUpdate)
  useEffect(() => {
    const prevProps = prevPropsRef.current;

    if (seekTo !== prevProps.seekTo && playerRef.current) {
      playerRef.current.seek(seekTo);
    }

    if (
      monitorDetails &&
      prevProps.monitorDetails &&
      monitorDetails.activeDisplayId !== prevProps.monitorDetails.activeDisplayId
    ) {
      const { videoId, activeDisplayId } = monitorDetails;
      const currentTime = playerRef.current?.getState()?.player?.currentTime || 0;
      updateParentProps?.(currentTime, videoId, activeDisplayId);
    }

    prevPropsRef.current = { seekTo, monitorDetails };
  }, [seekTo, monitorDetails]);

  return (
    <div>
      {showLoadingText && <span style={loadingText}>Please wait, video is decrypting...</span>}
      <Player
        ref={playerRef}
        playsInline
        fluid
        preload="auto"
        muted
        aspectRatio="16:9"
        startTime={seekTo}
        src={src}
        autoPlay={playNext}
        onSeeked={handleSeek}
        onSeeking={handleSeeking}
      >
        <BigPlayButton position="center" reset={reset} completed={completed} />
        <ControlBar autoHide={false} disableDefaultControls className="video-player-controls">
          <PlayToggle key="play-toggle" order={1} reset={reset} completed={completed} />
          <ReplayControl key="replay-control" order={2} />
          <ForwardControl key="forward-control" order={3} />
          <VolumeMenuButton key="volume-menu-button" order={4} />
          <CurrentTimeDisplay
            key="current-time-display"
            videoStartTime={startTime}
            videoEndTime={endTime}
            completed={completed}
          />
          <ProgressControl
            key="progress-control"
            order={8}
            videoDuration={duration}
            completed={completed}
            videoStartTime={startTime}
          />
          <FullscreenToggle key="fullscreen-toggle" order={11} />
        </ControlBar>
      </Player>
    </div>
  );
};

VideoPlayer.propTypes = {
  src: PropTypes.string,
  seekTo: PropTypes.number,
  playNext: PropTypes.bool,
  onEnded: PropTypes.func,
  onSeeked: PropTypes.func,
  onSeeking: PropTypes.func,
  completed: PropTypes.bool,
  reset: PropTypes.bool,
  startTime: PropTypes.number,
  endTime: PropTypes.number,
  duration: PropTypes.number,
  monitorDetails: PropTypes.shape({
    videoId: PropTypes.string,
    activeDisplayId: PropTypes.string,
  }),
  updateParentProps: PropTypes.func,
};

VideoPlayer.defaultProps = {
  src: '',
  seekTo: 0,
  playNext: true,
  onEnded: () => {},
  onSeeked: () => {},
  onSeeking: () => {},
  completed: false,
  reset: false,
  startTime: 0,
  endTime: 0,
  duration: 0,
  monitorDetails: null,
  updateParentProps: () => {},
};

export default VideoPlayer;
