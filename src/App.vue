<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { GM_cookie, GM_xmlhttpRequest } from '$';
import {
  Delete,
  Plus,
  Refresh,
  Setting,
} from '@element-plus/icons-vue';
import { reactive, ref } from 'vue';
import addButton from "./assets/add.svg";
import { Record } from "./Record";

const clickState = ref(0)
const RecordList = ref<Array<Record>>([])

const serverHost = "127.0.0.1:3600"
const addDialog = ref(false)

function startClick() {
  clickState.value = 1 - clickState.value
}

const addInfo = reactive({
  name: "",
  season_id: "",
  search_id: "",
  cookie: "",
})

function RefreshRecordList() {
  const url = ("http://" + serverHost + "/list")
  console.log("Request: " + url)
  GM_xmlhttpRequest({
    method:"GET",
    url: url,
    headers: {
      "Accept": "text/xml"
    },
    onload: (response) => {
      if (response.status != 200) {
        console.log("Respone fail, err: " + response.status)
        return
      }
      let data : Array<Record> = JSON.parse(response.responseText)
      RecordList.value = data;
    },
  })
}

async  function DeleteRecordRequest(recordID: number) {
  const url = ("http://" + serverHost + "/delete?id=" + recordID)
  console.log("Request: " + url)
  await GM_xmlhttpRequest({
    method:"GET",
    url: url,
    headers: {
      "Accept": "text/xml"
    },
    onload: (response) => {
      if (response.status != 200) {
        console.log("Respone fail, err: " + response.status)
        return
      }
    },
  })
}


async function AddRecordRequest() {
  const url = ("http://" + serverHost + "/add")
  console.log("Request: " + url)
  await GM_xmlhttpRequest({
    method:"POST",
    url: url,
    headers: {
      "Accept": "text/xml",
      "Content-Type": "application/json",
    },
    data: JSON.stringify(addInfo),
    onload: (response) => {
      if (response.status != 200) {
        console.log("Respone fail, err: " + response.status)
        return
      }
    },
  })
}

async function AddRecord() {
  addDialog.value = false;
  await AddRecordRequest();
  RefreshRecordList();
}

async function OpenAddRecordDialog() {
  const wurl = window.location.href;
  var re = new RegExp("search/([^/]*?)/([^/\?#]+)");
  var m = re.exec(wurl);
  if (m == null) {
    alert("请先搜索需要的物品");
    return;
  }
  addInfo.search_id = m[2];
  addInfo.season_id = decodeURI(m[1]);
  await GM_cookie.list({
  }, (cookies, err) => {
    let cookieStr : string[] = [];
    for (let c of cookies) {
      cookieStr.push(c.name + "=" + c.value);
    }
    addInfo.cookie = cookieStr.join("; ");
  })
  addDialog.value = true;
}

async function DeleteRecord(id: number) {
  console.log(id)
  await DeleteRecordRequest(id)
  RefreshRecordList()
}

</script>

<template>
  <div class="start">
    <img :src="addButton" alt="" style="height: 50px; width: 50px;"
      :class="[clickState ? 'rotating' : 'non-rotating']"
      @click="startClick"
    >
  </div>
  <el-drawer v-model="clickState" title="PoeWatcher" :with-header="true" size="50%">
    <el-row>
      <el-col :span="24">
        <el-button type="primary" :icon="Plus" @click="OpenAddRecordDialog" circle> </el-button>
        <el-button type="warning" :icon="Refresh" circle @click="RefreshRecordList"></el-button>
        <el-button type="info" :icon="Setting" circle></el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-table :data="RecordList">
        <el-table-column prop="id" label="ID"></el-table-column>
        <el-table-column prop="name" label="Name"></el-table-column>
        <el-table-column prop="season_id" label="SeasonID"></el-table-column>
        <el-table-column prop="search_id" label="SearchID"></el-table-column>
        <el-table-column prop="Operation" label="SearchType">
          <template v-slot="scope">
            <el-button :icon="Delete" type="danger" @click="DeleteRecord(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
  </el-drawer>
  <el-dialog v-model="addDialog" title="添加记录">
    <el-form :model="addInfo" :inline="false" label-position="top">
      <el-form-item label="名称">
        <el-input v-model="addInfo.name" clearable></el-input>
      </el-form-item>
      <el-form-item label="赛季">
        <el-input v-model="addInfo.season_id" disabled clearable></el-input>
      </el-form-item>
      <el-form-item label="搜索内容">
        <el-input v-model="addInfo.search_id" disabled clearable></el-input>
      </el-form-item>
      <el-form-item label="Cookie">
        <el-input v-model="addInfo.cookie" disabled type="text" clearable></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="addDialog = false">
          取消
        </el-button>
        <el-button @click="AddRecord" type="primary">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scope>
.start {
  background-color: transparent;
  position: fixed;
  top: 10px;
  right: 20px;
}

.non-rotating {
  transform:rotate(0);
  transition:all .3s linear;
  -webkit-transform:rotate(0deg);
  -webkit-transition:all .3s linear;
}

.rotating {
  transform:rotate(45deg);
  transition:all .3s linear;
  -webkit-transform:rotate(45deg);
  -webkit-transition:all .3s linear;
}

</style>
