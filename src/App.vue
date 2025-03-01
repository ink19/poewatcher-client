<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { GM_cookie, GM_xmlhttpRequest } from '$';
import {
  Delete,
  Plus,
  Refresh,
  Setting,
  VideoPause,
  VideoPlay,
} from '@element-plus/icons-vue';
import { reactive, ref } from 'vue';
import addButton from "./assets/add.svg";
import { Record } from "./Record";

const clickState = ref(0)
const RecordList = ref<Array<Record>>([])

const addDialog = ref(false)

const settingDialogState = ref(false)
const settingInfo = reactive({
  serverHost: "127.0.0.1:3600",
})

function concatUrl(action : string) {
  return "http://" + settingInfo.serverHost + "/" + action;
}

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
  const url = concatUrl("list")
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
  const url = concatUrl("delete") + "?id=" + recordID
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

async function PauseRecordRequest(recordID: number) {
  const url = concatUrl("pause") + "?id=" + recordID
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
  const url = concatUrl("add")
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

function OpenSettingDialog() {
  settingDialogState.value = true;
}

async function DeleteRecord(id: number) {
  console.log(id)
  await DeleteRecordRequest(id)
  RefreshRecordList()
}

async function PauseRecord(id: number) {
  console.log(id)
  await PauseRecordRequest(id)
  RefreshRecordList()
}

async function StartRecordRequest(recordID: number) {
  const url = concatUrl("start") + "?id=" + recordID
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

async function StartRecord(id: number) {
  console.log(id)
  await StartRecordRequest(id)
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
        <el-button type="info" :icon="Setting" circle @click="OpenSettingDialog"></el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-table :data="RecordList">
        <el-table-column prop="id" label="ID"></el-table-column>
        <el-table-column prop="name" label="别名"></el-table-column>
        <el-table-column prop="season_id" label="赛季名"></el-table-column>
        <el-table-column prop="search_id" label="搜索ID"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag v-if="scope.row.status == 1" type="success">
              运行中
            </el-tag>
            <el-tag v-if="scope.row.status == 2" type="info">
              暂停中
            </el-tag>
            <el-tag v-if="scope.row.status == 3" type="warning">
              异常
            </el-tag>
            <el-tag v-if="scope.row.status == 0" type="danger">
              未知
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="Operation" label="操作">
          <template v-slot="scope">
            <el-button :icon="Delete" type="danger" @click="DeleteRecord(scope.row.id)" circle></el-button>
            <el-button :icon="VideoPause" type="info" @click="PauseRecord(scope.row.id)" circle v-if="scope.row.status == 1"></el-button>
            <el-button :icon="VideoPlay" type="info" @click="StartRecord(scope.row.id)" circle v-if="scope.row.status == 2"></el-button>
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
  <el-dialog v-model="settingDialogState" title="设置页">
    <el-form :model="settingInfo" :inline="false" label-position="top">
      <el-form-item label="服务名">
        <el-input v-model="settingInfo.serverHost" clearable></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="settingDialogState = false" type="primary">
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
