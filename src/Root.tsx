import React from 'react';
import {Composition, Folder} from 'remotion';
import {RenderComposition, type RenderCompositionProps} from './render/renderComposition.js';

export const ROOT_COMPOSITION_ID = 'PassiveVoice';

export const createRoot = () => (
    <Folder name="Passive-Voice">
    <Composition
      id={ROOT_COMPOSITION_ID}
      component={RenderComposition}
      defaultProps={{}}
      durationInFrames={1}
      fps={30}
      width={1920}
      height={1080}
      calculateMetadata={({props}) => {
        const renderProps = props as RenderCompositionProps;
        return {
        durationInFrames: renderProps.resolvedTimeline === undefined
          ? 1
          : Math.ceil(renderProps.resolvedTimeline.totalDuration * 30),
        };
      }}
    />
  </Folder>
);
