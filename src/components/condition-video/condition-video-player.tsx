import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ConditionVideo } from '@/services/api/types';
import { resolveVideoEmbedUrl } from '@/utils/video-url';

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
      <LocalVideoPlayer uri={embedUrl} height={height} />
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
