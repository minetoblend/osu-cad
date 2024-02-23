<script lang="ts">
import { PropType, VNode } from 'vue';

export default defineComponent({
  props: {
    vnodes: {
      type: Array as PropType<VNode[]>,
      required: true,
    },
  },
  setup(props) {
    return () => props.vnodes;
  },
});
</script>
