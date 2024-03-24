import devalue from '@nuxt/devalue';

export function renderInitialState(state: unknown): string {
  return `<script>var initialState = ${devalue(state)}</script>`;
}
