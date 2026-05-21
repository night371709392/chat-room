<template>
  <div class="contact-index-list">
    <slot name="before" />
    <div class="index-scroll">
      <van-index-bar
        v-if="groupedList.length"
        :index-list="indexList"
        :sticky="false"
        highlight-color="#2830D3"
      >
        <template v-for="group in groupedList">
          <van-index-anchor :key="'anchor-' + group.letter" :index="group.letter" />
          <div
            v-for="item in group.items"
            :key="group.letter + '-' + resolveKey(item)"
            class="item"
            @click="$emit('select', item)"
          >
            <slot name="item" :item="item" />
          </div>
        </template>
      </van-index-bar>
      <p v-else-if="showEmpty" class="empty-tip">{{ emptyText }}</p>
    </div>
  </div>
</template>

<script>
import { groupByLetter } from '@/utils/contactIndexGroup'

export default {
  name: 'ContactIndexList',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    getName: {
      type: Function,
      required: true
    },
    itemKey: {
      type: [String, Function],
      default: 'id'
    },
    showEmpty: {
      type: Boolean,
      default: true
    },
    emptyText: {
      type: String,
      default: '暂无数据'
    }
  },
  computed: {
    groupedList () {
      return groupByLetter(this.items, this.getName)
    },
    indexList () {
      return this.groupedList.map(g => g.letter)
    }
  },
  methods: {
    resolveKey (item) {
      if (typeof this.itemKey === 'function') return this.itemKey(item)
      const k = item && item[this.itemKey]
      return k != null ? String(k) : JSON.stringify(item)
    }
  }
}
</script>

<style scoped>
.contact-index-list {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}
.index-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}
.empty-tip {
  margin: 24px 0;
  text-align: center;
  font-size: 13px;
  color: #909399;
}
.contact-index-list >>> .van-index-bar__sidebar {
  position: absolute;
  top: 50%;
  right: 2px;
  transform: translateY(-50%);
  z-index: 100;
  font-size: 15px !important;
  line-height: 22px;
  text-align: center;
  padding: 6px 1px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  user-select: none;
}
.contact-index-list >>> .van-index-bar__index {
  display: block;
  padding: 3px 6px;
  font-size: 15px !important;
  color: #606266;
  border-radius: 4px;
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
}
.contact-index-list >>> .van-index-bar__index--active {
  color: #2830D3;
  font-weight: 600;
  background: rgba(40, 48, 211, 0.1);
}
.contact-index-list >>> .van-index-anchor {
  padding: 4px 12px;
  font-size: 12px;
  color: #909399;
  background: #f5f6f8;
  line-height: 20px;
}
.contact-index-list .item {
  height: 60px;
  display: flex;
  position: relative;
  padding: 5px 28px 5px 10px;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.contact-index-list .item:hover {
  background: #f8f9fc;
}
</style>
