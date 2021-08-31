Kiến trúc code trong match

```js
/** 
* Vector chứa các trận đấu đang chờ 
* PersistentVector ~ List ~ Danh sách liên kết đơn/đôi
**/
const waitingMatch = new PersistentVector<Match>("w");
```

```js
/**
* Vector chứa các trận đấu đang diễn ra
* Khi 1 trận đấu đang ở waiting mà đủ người chơi, trận đấu sẽ chuyển sang trạng thái running
* Trình tự: Remove match from waitingMatch Vertor -> Insert to RunningMatch Vector
**/
const runningMatch = new PersistentVector<Match>("r");
```

```js
/**
* Vector chứa các trận đấu đã diễn ra
* Khi 1 trận đấu đang ở running mà đã có kết quả, dữ liệu trận đấu sẽ được lưu vào finishedMatch
* Trình tự: Remove match from runningMatch vector -> Insert to FinishedMatch Vector
**/
const finishedMatch = new PersistentVector<Match>("f");
```

```js
/**
* Vector chứa lịch sử thi đấu của người chơi
* Khi runningMatch hoàn thành, trận đấu sẽ kết thúc
* Hệ thống sẽ ghi nhận người thắng/ thua và lưu vào danh sách lịch sử của người chơi
**/
const historyMatch = new PersistentMap<String, PersistentVector<History>>("h")
```