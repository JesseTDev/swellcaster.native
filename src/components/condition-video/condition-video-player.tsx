import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedText } from '@/components/themed-text';
import type { ConditionVideo } from '@/services/api/types';
import { isYouTubeVideo, resolveVideoEmbedUrl } from '@/utils/video-url';

interface ConditionVideoPlayerProps {
  video: ConditionVideo;
  height?: number;
}

function LocalVideoPlayer({ uri, height }: { uri: string; height: number }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={[styles.player, { height }]}
      contentFit="cover"
      nativeControls
    />
  );
}

function YouTubeEmbedPlayer({ embedUrl, height }: { embedUrl: string; height: number }) {
  const html = `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1">
<style>*{margin:0;padding:0}body{background:#000}iframe{width:100%;height:100vh;border:0}</style>
</head><body>
<iframe src="${embedUrl}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</body></html>`;

  return (
    <WebView
      source={{ html }}
      style={[styles.player, { height }]}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
    />
  );
}

export function ConditionVideoPlayer({ video, height = 200 }: ConditionVideoPlayerProps) {
  const embedUrl = resolveVideoEmbedUrl(video);

  return (
    <View style={styles.wrap}>
      <ThemedText themeColor="textSecondary" style={styles.caption}>
        Live conditions · expires{' '}
        {new Date(video.expiresAtUtc).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })}
      </ThemedText>
      {isYouTubeVideo(video) ? (
        <YouTubeEmbedPlayer embedUrl={embedUrl} height={height} />
      ) : (
        <LocalVideoPlayer uri={embedUrl} height={height} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    gap: 6,
  },
  caption: {
    fontSize: 11,
  },
  player: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
});
