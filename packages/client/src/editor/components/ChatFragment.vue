<script lang="ts">
import { PropType } from 'vue';
import { ChatFragment } from '@osucad/common';

export default defineComponent({
  props: {
    fragment: {
      type: Object as PropType<ChatFragment>,
      required: true,
    },
    ownUserId: Number,
  },
  emits: ['timestamp-click'],
  methods: {
    onTimestampClick() {
      if (this.fragment.type === 'timestamp') {
        this.$emit('timestamp-click', {
          time: this.fragment.time,
          objects: this.fragment.objects,
        });
      }
    },
  },
  render() {
    switch (this.fragment.type) {
      case 'code':
        return h('span', { class: 'code' }, this.fragment.text);
      case 'timestamp':
        return h(
          'span',
          {
            class: 'timestamp',
            onClick: this.onTimestampClick,
          },
          this.fragment.text,
        );
      case 'mention':
        return h(
          'span',
          {
            class: {
              mention: true,
              'mention-own': this.fragment.mention === this.ownUserId,
            },
          },
          this.fragment.text,
        );
      case 'newline':
        return h('span', '\n');
      default:
        return h('span', this.fragment.text!);
    }
  },
});
</script>

<style lang="scss" scoped>
.code {
  background-color: rgba(white, 0.2);
  border-radius: 3px;
  padding: 0.25rem;
  font-family: monospace;
}

.timestamp {
  background-color: rgba(white, 0.2);
  border-radius: 3px;
  padding: 0.25rem;
  font-family: monospace;
  color: $primary;
  cursor: pointer;
}

.mention {
  font-weight: bold;

  &.mention-own {
    color: $primary;
  }
}
</style>
