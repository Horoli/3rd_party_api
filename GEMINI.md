# GEMINI.md - Project Context Guide

이 파일은 Gemini CLI가 이 프로젝트를 이해하고 효율적으로 작업하기 위한 가이드라인을 제공합니다.

## 🚀 프로젝트 개요 (Project Overview)
이 프로젝트는 **Path of Exile (PoE)** 관련 데이터와 **Steam API**를 통합하여 제공하는 **Node.js 기반의 백엔드 API 서버**입니다. Fastify 프레임워크를 사용하여 고성능 비동기 API를 제공하며, MongoDB를 데이터 저장소로 사용합니다.

### 핵심 기술 스택
- **Runtime:** Node.js
- **Framework:** Fastify (v4+)
- **Database:** MongoDB (Native Driver v6+)
- **API Integration:** SteamAPI, PoE Ninja, poe-api-manager, node-cron
- **Scraping:** Cheerio (Wiki 크롤링 등)
- **Security:** bcryptjs, crypto

## 📂 주요 디렉토리 구조 (Directory Structure)
- `src/`: 핵심 소스 코드
  - `index.js`: 웹 서버 클래스 및 초기화 로직 (라우트/미들웨어 동적 로드, 크론 작업 설정)
  - `routes/v1/`: 버전별 API 엔드포인트 정의 (파일명이 곧 라우트 경로가 됨)
  - `middlewares/`: 인증, 관리자 체크 등의 미들웨어 로직
  - `assets/json/`: 스킬 젬 정보 등 정적 데이터 (JSON)
- `utility/`: 공통 유틸리티 및 모듈 인스턴스
  - `mongodb.js`: MongoDB 연결 및 컬렉션 관리 (Singleton)
  - `steamapi.js`: Steam API 연동 래퍼
  - `poe_ninja.js`: PoE Ninja 데이터 캐싱 및 연동
  - `index.js`: 암호화(UUID, Hash) 및 시간 관련 유틸리티
- `app.js`: 애플리케이션 엔트리 포인트 (포트: 2017)
- `poe_wiki_crawler.js`: PoE 위키 데이터 수집용 크롤러 스크립트

## 🛠️ 실행 및 개발 가이드 (Commands & Usage)

### 의존성 설치
```bash
npm install
```

### 서버 실행
```bash
node app.js
```
*기본 포트는 `2017`이며, `src/index.js`에서 수정 가능합니다.*

### 환경 설정 (.env)
- `TZ`: 타임존 설정 (기본값: 'Asia/Seoul')
- *참고: MongoDB 호스트(`172.16.0.7`) 및 Steam API 키 등은 현재 코드 내부에 하드코딩되어 있으므로 필요 시 수정을 고려해야 합니다.*

## 📜 개발 컨벤션 (Conventions)
1. **Module Alias:** `better-module-alias`를 사용하여 `@Utility` 별칭으로 `utility/` 폴더에 접근합니다.
2. **Route Loading:** `src/index.js`의 `_loadRoutes` 메서드가 `src/routes/` 폴더 내의 파일들을 재귀적으로 읽어 자동으로 API 엔드포인트를 등록합니다.
3. **Singleton Pattern:** MongoDB와 SteamAPI 등 주요 리소스는 `sharedInstance()` 또는 클래스 멤버 심볼을 통한 싱글톤 패턴으로 관리됩니다.
4. **Scarab Data Integration:**
   - Scarab의 이름과 이미지는 기존 라이브러리(`poe-api-manager`)를 사용하지만, 가격 정보(`chaosValue`)는 최신화를 위해 신규 **Exchange API**(`poe.ninja/poe1/api/economy/exchange/current/overview`)에서 가져옵니다.
   - 라이브러리 데이터와 신규 API 데이터는 **아이템 이름(`name`)을 기준으로 매칭**합니다.
   - 가격 데이터(`primaryValue`)는 가독성을 위해 **정수로 반올림(`Math.round`)**하여 처리합니다.
5. **Response Format:** 모든 API 응답은 `utility/general_response.js`를 통해 규격화된 포맷으로 전달하는 것을 권장합니다.
6. **Scheduled Tasks:** `node-cron`을 사용하여 정기적인 데이터 갱신을 수행하며, `src/index.js`에서 중앙 관리합니다.

## ⚠️ 주의 사항
- **Hardcoded Config:** 현재 MongoDB 연결 정보 및 일부 API 키가 `src/index.js`와 `utility/` 내부에 직접 작성되어 있습니다. 운영 환경 적용 시 `.env`로의 분리가 필요합니다.
- **Git Ignore:** `ref/`, `node_modules/`, `package-lock.json`, `.env` 폴더 및 파일들은 Git 관리 대상에서 제외되어 있습니다.
- **Steam API Auth:** `src/index.js`의 `start()` 메서드에서 SteamAPI를 더미 키(`"aaa"`)로 초기화하고 있으므로 실제 연동을 위해서는 유효한 키가 필요합니다.
- **External Dependencies:** PoE Ninja 등 외부 API 데이터는 `node-cron`을 통해 **매시간 정각**에 캐싱(`$_initInverval`)됩니다.
